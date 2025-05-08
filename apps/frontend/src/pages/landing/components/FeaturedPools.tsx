import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FeaturedPool() {
  return (
    <section id="pools" className="py-16 bg-muted/50 bg-[#F5FBFF]">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Featured Insurance Pools
            </h2>
            <p className="text-muted-foreground md:text-xl">
              Explore our most popular insurance options
            </p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-12">
          <Card className="bg-background">
            <CardHeader>
              <CardTitle>Flight Delay Insurance</CardTitle>
              <CardDescription>
                Protection against flight delays and cancellations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Total Value Locked
                  </span>
                  <span className="font-medium">250,000 USDC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Members</span>
                  <span className="font-medium">1,250</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Claims Paid</span>
                  <span className="font-medium">95%</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/pools/POOL-001`}>
                <Button className="w-full bg-blue-500 hover:bg-blue-800">
                  View Details
                </Button>
              </Link>
            </CardFooter>
          </Card>
          <Card className="bg-background">
            <CardHeader>
              <CardTitle>Crypto Asset Protection</CardTitle>
              <CardDescription>
                Coverage against smart contract vulnerabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Total Value Locked
                  </span>
                  <span className="font-medium">500,000 USDC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Members</span>
                  <span className="font-medium">850</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Claims Paid</span>
                  <span className="font-medium">92%</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/pools/POOL-002`}>
                <Button className="w-full bg-blue-500 hover:bg-blue-800">
                  View Details
                </Button>
              </Link>
            </CardFooter>
          </Card>
          <Card className="bg-background">
            <CardHeader>
              <CardTitle>Health Emergency Fund</CardTitle>
              <CardDescription>
                Community-funded healthcare coverage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Total Value Locked
                  </span>
                  <span className="font-medium">750,000 USDC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Members</span>
                  <span className="font-medium">2,100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Claims Paid</span>
                  <span className="font-medium">98%</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/pools/POOL-003`}>
                <Button className="w-full bg-blue-500 hover:bg-blue-800">
                  View Details
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
        <div className="flex justify-center mt-8">
          <Link href="/pools">
            <Button variant="outline" size="lg">
              View All Insurance Pools
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
