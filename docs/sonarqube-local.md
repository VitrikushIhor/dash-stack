# Local SonarQube

The local SonarQube stack is isolated from the application Compose projects. It
uses its own PostgreSQL database, network, and persistent volumes.

## First-time setup

1. Copy `.env.sonarqube.example` to `.env.sonarqube` and replace the database
   password.
2. Start the server:

   ```bash
   pnpm sonar:up
   ```

3. Open <http://localhost:9000>. The initial credentials are `admin` / `admin`;
   SonarQube requires changing the password on first login.
4. Create a local project with the key `dash-stack-local`.
5. Create a project analysis token and save it as `SONAR_TOKEN` in
   `.env.sonarqube`.
6. Run the analysis:

   ```bash
   pnpm sonar:scan
   ```

## Commands

```bash
pnpm sonar:up       # start SonarQube and its database
pnpm sonar:status   # show container health
pnpm sonar:logs     # follow SonarQube logs
pnpm sonar:scan     # analyze frontend and backend
pnpm sonar:down     # stop the stack and preserve data
```

Do not add `--volumes` to the down command unless the local SonarQube database
and all analysis history should be deleted.

## VS Code Connected Mode

After the first successful scan, add a SonarQube Server connection in the
SonarQube for IDE extension using `http://localhost:9000`, then bind the
workspace to `dash-stack-local`. The IDE will use the local project's quality
profiles and analysis-scope settings.

Rule activation and severity belong in the local Quality Profiles. Repository
path-specific exclusions remain in `sonar-project.properties` so they are
versioned and repeatable.
