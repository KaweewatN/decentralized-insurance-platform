import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RateService {
  private readonly logger = new Logger(RateService.name);

  // Cache variables as class properties
  private ethToThbRateCache: number = 0;
  private lastUpdateTime: number = 0;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 30 minutes in milliseconds

  async getEthToThbRate(): Promise<number> {
    const now = Date.now();

    // If we have a cached value that's less than cache duration, use it
    if (
      this.ethToThbRateCache > 0 &&
      now - this.lastUpdateTime < this.CACHE_DURATION
    ) {
      const remainingSeconds = Math.floor(
        (this.CACHE_DURATION - (now - this.lastUpdateTime)) / 1000,
      );
      this.logger.log(
        `💰 [Cache] Using cached ETH/THB rate: ${this.ethToThbRateCache.toFixed(2)} THB (valid for ${remainingSeconds} seconds)`,
      );
      return this.ethToThbRateCache;
    }

    // Otherwise, fetch a new rate
    // 1) Coinbase
    try {
      const cb = await axios.get(
        'https://api.coinbase.com/v2/prices/ETH-THB/spot',
        { timeout: 5000 },
      );
      const cbRate = parseFloat(cb.data.data.amount);

      // Store in cache
      this.ethToThbRateCache = cbRate;
      this.lastUpdateTime = now;

      this.logger.log(
        `💰 [Coinbase] 1 ETH = ${cbRate.toFixed(2)} THB (cached for ${this.CACHE_DURATION / 60000} minutes)`,
      );
      return cbRate;
    } catch (e1) {
      this.logger.warn(
        '⚠️ Coinbase ETH→THB failed, trying Bitkub...',
        e1.message,
      );
    }

    // 2) Bitkub
    try {
      const bk = await axios.get('https://api.bitkub.com/api/market/ticker', {
        timeout: 5000,
      });
      const bkRate = parseFloat(bk.data.ETH_THB.last);

      // Store in cache
      this.ethToThbRateCache = bkRate;
      this.lastUpdateTime = now;

      this.logger.log(
        `💰 [Bitkub] 1 ETH = ${bkRate.toFixed(2)} THB (cached for ${this.CACHE_DURATION / 60000} minutes)`,
      );
      return bkRate;
    } catch (e2) {
      this.logger.warn(
        '⚠️ Bitkub ETH→THB failed, falling back to Binance+FX...',
        e2.message,
      );
    }

    // 3) Binance + FX
    try {
      const [ethUsdRes, fxRes] = await Promise.all([
        axios.get(
          'https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT',
          { timeout: 5000 },
        ),
        axios.get('https://open.er-api.com/v6/latest/USD', { timeout: 5000 }),
      ]);
      const ethUsd = parseFloat(ethUsdRes.data.price);
      const usdToThb = fxRes.data.rates.THB;
      const fallbackRate = ethUsd * usdToThb;

      // Store in cache
      this.ethToThbRateCache = fallbackRate;
      this.lastUpdateTime = now;

      this.logger.log(
        `💰 [Binance+FX] 1 ETH = ${fallbackRate.toFixed(2)} THB (cached for ${this.CACHE_DURATION / 60000} minutes)`,
      );
      return fallbackRate;
    } catch (e3) {
      this.logger.error('❌ All ETH→THB fetch methods failed', e3.message);

      // Fallback to cached value if exists (even if expired)
      if (this.ethToThbRateCache > 0) {
        this.logger.warn(
          `🔄 Using stale cached rate: ${this.ethToThbRateCache.toFixed(2)} THB`,
        );
        return this.ethToThbRateCache;
      }

      // Last resort: fixed rate
      const fixedRate = 120000;
      this.logger.warn(`🆘 Using fixed fallback rate: ${fixedRate} THB`);
      return fixedRate;
    }
  }

  getCurrentCachedRate(): { rate: number; expiresIn: number } {
    const now = Date.now();
    if (
      this.ethToThbRateCache > 0 &&
      now - this.lastUpdateTime < this.CACHE_DURATION
    ) {
      const expiresIn = Math.floor(
        (this.CACHE_DURATION - (now - this.lastUpdateTime)) / 1000,
      );
      return {
        rate: this.ethToThbRateCache,
        expiresIn, // seconds remaining
      };
    }
    return { rate: 0, expiresIn: 0 };
  }

  // ✅ FIX: Convert THB to ETH with precision control
  async convertThbToEth(thbAmount: number): Promise<number> {
    const rate = await this.getEthToThbRate();
    const ethAmount = thbAmount / rate;

    // ✅ จำกัดทศนิยมเป็น 8 หลัก (เพียงพอสำหรับ ETH และไม่เกิน wei limit)
    const preciseEthAmount = Math.floor(ethAmount * 100000000) / 100000000;

    this.logger.log(
      `💱 Converting ${thbAmount} THB → ${preciseEthAmount.toFixed(8)} ETH (rate: ${rate.toFixed(2)})`,
    );

    return preciseEthAmount;
  }

  // ✅ FIX: Convert ETH to THB with precision control
  async convertEthToThb(ethAmount: number): Promise<number> {
    const rate = await this.getEthToThbRate();
    const thbAmount = ethAmount * rate;

    // ✅ จำกัดทศนิยมเป็น 2 หลัก (สำหรับสกุลเงิน THB)
    const preciseThbAmount = Math.round(thbAmount * 100) / 100;

    this.logger.log(
      `💱 Converting ${ethAmount.toFixed(8)} ETH → ${preciseThbAmount.toFixed(2)} THB (rate: ${rate.toFixed(2)})`,
    );

    return preciseThbAmount;
  }

  // ✅ เพิ่ม utility method สำหรับแปลง ETH เป็น wei string ที่ปลอดภัย
  ethToWeiString(ethAmount: number): string {
    // จำกัดทศนิยมเป็น 8 หลักก่อนแปลงเป็น wei
    const preciseEth = Math.floor(ethAmount * 100000000) / 100000000;
    const ethString = preciseEth.toFixed(8);

    try {
      // ใช้ ethers v6 syntax
      const { ethers } = require('ethers');
      return ethers.parseEther(ethString).toString();
    } catch (error) {
      this.logger.error(
        `❌ Cannot convert ${ethString} ETH to wei: ${error.message}`,
      );
      throw new Error(`ETH to wei conversion failed: ${error.message}`);
    }
  }

  // ✅ เพิ่ม utility method สำหรับแปลง wei กลับเป็น ETH
  weiToEth(weiAmount: string): number {
    try {
      const { ethers } = require('ethers');
      return parseFloat(ethers.formatEther(weiAmount));
    } catch (error) {
      this.logger.error(
        `❌ Cannot convert ${weiAmount} wei to ETH: ${error.message}`,
      );
      throw new Error(`Wei to ETH conversion failed: ${error.message}`);
    }
  }

  // Get rate info for status endpoint
  async getRateInfo() {
    try {
      await this.getEthToThbRate(); // Ensure we have latest rate
      const cached = this.getCurrentCachedRate();

      return {
        currentRate: cached.rate,
        expiresIn: cached.expiresIn,
        lastUpdated: new Date(this.lastUpdateTime).toISOString(),
        cacheDurationMinutes: this.CACHE_DURATION / 60000,
        isStale: cached.expiresIn <= 0,
      };
    } catch (error) {
      return {
        error: 'Failed to get rate info',
        message: error.message,
      };
    }
  }
}
