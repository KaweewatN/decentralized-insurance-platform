### Documentation for package.json Commands

---

#### **General Commands**

- **`yarn bootstrap`**: Installs dependencies for all packages in the monorepo and links them together using Lerna.
- **`yarn build`**: Runs the `build` script for all packages in the monorepo.
- **`yarn test`**: Executes the `test` script for all packages in the monorepo.
- **`yarn lint`**: Runs the `lint` script for all packages in the monorepo.
- **`yarn start`**: Starts all packages in parallel using their `start` scripts.
- **`yarn dev`**: Runs the `dev` script for both the `frontend` and `backend` packages in parallel.

---

#### **Backend-Specific Commands (NestJS)**

- **`yarn nest-build`**: Builds the `backend` package using its `build` script.
- **`yarn nest-start`**: Starts the `backend` package using its `start` script.
- **`yarn nest-dev`**: Runs the `dev` script for the `backend` package.
- **`yarn nest-test`**: Executes the `test` script for the `backend` package.
- **`yarn nest-test-watch`**: Runs the `test:watch` script for the `backend` package to watch for changes and re-run tests.

---

#### **Frontend-Specific Commands (Next.js)**

- **`yarn next-build`**: Builds the `frontend` package using its `build` script.
- **`yarn next-start`**: Starts the `frontend` package using its `start` script.
- **`yarn next-dev`**: Runs the `dev` script for the `frontend` package.

---

#### **Smart Contract Commands (Hardhat)**

- **`yarn contract-compile`**: Compiles the smart contracts in the contracts package using Hardhat.
- **`yarn contract-test`**: Runs the tests for the smart contracts in the contracts package using Hardhat.
- **`yarn contract-deploy`**: Deploys the smart contracts using the `scripts/deploy.ts` script in the contracts package with Hardhat.

---

#### **Utility Commands**

- **`yarn install-all`**: Installs dependencies for the contracts, `frontend`, and `backend` packages.
- **`yarn add-frontend`**: Adds a dependency to the `frontend` package.
- **`yarn add-backend`**: Adds a dependency to the `backend` package.
- **`yarn add-contracts`**: Adds a dependency to the contracts package.
- **`yarn remove-frontend`**: Removes a dependency from the `frontend` package.
- **`yarn remove-backend`**: Removes a dependency from the `backend` package.
- **`yarn remove-contracts`**: Removes a dependency from the contracts package.

---
