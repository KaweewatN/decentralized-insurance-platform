### General Commands

- **`yarn bootstrap`**: Runs `lerna bootstrap` to install dependencies for all packages in the monorepo and link them together.
- **`yarn build`**: Executes the `build` script for all packages in the monorepo using Lerna.
- **`yarn test`**: Runs the `test` script for all packages in the monorepo.
- **`yarn lint`**: Executes the `lint` script for all packages in the monorepo.
- **`yarn start`**: Starts all packages in parallel using their `start` scripts.

### Development Commands 👍🏻👍🏻👍🏻 (use this)

- **`yarn dev`**: Runs the `dev` script for both the `frontend` and `backend` packages in parallel.

### Backend-Specific Commands (NestJS)

- **`yarn nest-build`**: Builds the `backend` package using its `build` script.
- **`yarn nest-start`**: Starts the `backend` package using its `start` script.
- **`yarn nest-dev`**: Runs the `dev` script for the `backend` package.
- **`yarn nest-test`**: Executes the `test` script for the `backend` package.
- **`yarn nest-test-watch`**: Runs the `test:watch` script for the `backend` package to watch for changes and re-run tests.

### Frontend-Specific Commands (Next.js)

- **`yarn next-build`**: Builds the `frontend` package using its `build` script.
- **`yarn next-start`**: Starts the `frontend` package using its `start` script.
- **`yarn next-dev`**: Runs the `dev` script for the `frontend` package.

### Smart Contract Commands (Hardhat)

- **`yarn contract-compile`**: Compiles the smart contracts in the contracts package using Hardhat.
- **`yarn contract-test`**: Runs the tests for the smart contracts in the contracts package using Hardhat.
- **`yarn contract-deploy`**: Deploys the smart contracts using the `scripts/deploy.ts` script in the contracts package with Hardhat.
