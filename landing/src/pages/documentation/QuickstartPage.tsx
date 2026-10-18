import { CodeBlock } from '@/components/ui/CodeBlock';
import {
  A,
  Callout,
  Code,
  DocTitle,
  H2,
  Lead,
  P,
  Step,
  Steps,
  Table,
  UL,
} from '@/components/documentation/Prose';
import { REPO_URL } from '@/site';

const CLONE = `
git clone ${REPO_URL}.git
cd metis
`;

const GENERATE_SECRETS = `
# JWT_SECRET_KEY: signs session cookies
openssl rand -hex 32

# ENCRYPTION_KEY: a Fernet key that encrypts GitHub tokens at rest
openssl rand -base64 32 | tr '+/' '-_'
`;

const ENV_MINIMAL = `
# GitHub App (see the GitHub App guide)
GITHUB_APP_ID=123456
GITHUB_CLIENT_ID=Iv23liExample
GITHUB_CLIENT_SECRET_ID=your-client-secret
GITHUB_WEBHOOK_SECRET=your-webhook-secret

# LLM: any LiteLLM model string, plus that provider's key
MODEL_NAME=gpt-4o
OPENAI_API_KEY=sk-...

# Secrets you generated above
JWT_SECRET_KEY=...
ENCRYPTION_KEY=...

# Daytona sandboxes
DAYTONA_API_KEY=dtn_...
DAYTONA_API_URL=https://app.daytona.io/api
DAYTONA_TARGET=us

# Turn tracing off unless you have a LangSmith key
LANGSMITH_TRACING=false
`;

const START = `
make dev
# same as: docker compose -f docker-compose.dev.yml up --build
`;

const TUNNEL = `
ngrok http 8000
# Forwarding  https://f00d-1234.ngrok-free.app -> http://localhost:8000
`;

const WITHOUT_DOCKER = `
make infra-up       # PostgreSQL, Redis and pgAdmin only
make setup          # uv sync (backend) + pnpm install (frontend)
make migrate        # alembic upgrade head

# then, each in its own terminal:
make backend-dev    # API on http://localhost:8000
make worker-dev     # Celery worker
make frontend-dev   # dashboard on http://localhost:5173
`;

export function QuickstartPage() {
  return (
    <>
      <DocTitle eyebrow="Self-hosting">Quickstart</DocTitle>
      <Lead>
        Run the full Metis stack on one machine with Docker Compose, connect it to GitHub, and get
        your first AI review. Plan on about 20 minutes, most of it spent creating the GitHub App.
      </Lead>

      <Callout>
        <p>
          Before you start, check the <A href="/docs#requirements">requirements</A>: Docker, an LLM
          API key, a Daytona API key, and a way to expose port 8000 publicly.
        </p>
      </Callout>

      <Steps>
        <Step title="Clone the repository" id="clone">
          <CodeBlock code={CLONE} />
        </Step>

        <Step title="Create your GitHub App" id="github-app">
          <P>
            Metis acts through a GitHub App that you own. Follow the{' '}
            <A href="/docs/github-app">GitHub App guide</A>. For a local setup, use{' '}
            <Code>http://localhost:5173/auth/callback</Code> as the callback URL. You can fill in
            the webhook URL later, once your tunnel is running (step 6).
          </P>
          <P>When you're done, you will have:</P>
          <UL>
            <li>the App ID, Client ID, and a client secret</li>
            <li>the webhook secret you chose</li>
            <li>
              a private key <Code>.pem</Code> file
            </li>
          </UL>
        </Step>

        <Step title="Add the private key" id="private-key">
          <P>
            The Compose file mounts the key from a fixed path. Save your <Code>.pem</Code> as{' '}
            <Code>backend/metis-ai-testing.2025-11-21.private-key.pem</Code>, or change the{' '}
            <Code>volumes</Code> entry for both the <Code>api</Code> and <Code>worker</Code>{' '}
            services in <Code>docker-compose.dev.yml</Code> to point at your file.
          </P>
          <P>
            The key is git-ignored (<Code>*.pem</Code>). Never commit it.
          </P>
        </Step>

        <Step title="Configure the backend" id="configure">
          <P>Start from the example file:</P>
          <CodeBlock code="cp backend/.env.example backend/.env" />
          <P>Generate the two application secrets:</P>
          <CodeBlock code={GENERATE_SECRETS} />
          <P>
            Then edit <Code>backend/.env</Code>. This is the minimum for a working setup. The full
            list is in the <A href="/docs/configuration">configuration reference</A>.
          </P>
          <CodeBlock code={ENV_MINIMAL} title="backend/.env" />
          <Callout>
            <p>
              You don't need to edit the database, Redis, Celery, or <Code>FRONTEND_URL</Code>{' '}
              values. Docker Compose overrides them so the containers can reach each other.
            </p>
          </Callout>
        </Step>

        <Step title="Start the stack" id="start">
          <CodeBlock code={START} />
          <P>
            The API runs database migrations automatically on startup. When everything is healthy:
          </P>
          <Table
            head={['Service', 'URL']}
            rows={[
              ['Dashboard', <Code>http://localhost:5173</Code>],
              ['API', <Code>http://localhost:8000</Code>],
              ['API reference (OpenAPI)', <Code>http://localhost:8000/api/docs</Code>],
              ['pgAdmin', <Code>http://localhost:5050</Code>],
            ]}
          />
        </Step>

        <Step title="Expose the webhook endpoint" id="webhook">
          <P>GitHub needs to reach the API over the internet. Start a tunnel to port 8000:</P>
          <CodeBlock code={TUNNEL} />
          <P>
            In your GitHub App settings, set the <strong>Webhook URL</strong> to the tunnel address
            followed by <Code>/webhooks/github</Code>, for example{' '}
            <Code>https://f00d-1234.ngrok-free.app/webhooks/github</Code>. GitHub sends a{' '}
            <Code>ping</Code> event. Check that the delivery succeeded under{' '}
            <em>Advanced → Recent Deliveries</em>.
          </P>
        </Step>

        <Step title="Sign in and enable a repository" id="enable">
          <UL>
            <li>
              Install your GitHub App on the account or organization that owns your repositories, if
              you haven't already.
            </li>
            <li>
              Open <Code>http://localhost:5173</Code> and click <strong>Login with GitHub</strong>.
            </li>
            <li>
              Go to <strong>Repositories</strong>, click <strong>Sync from GitHub</strong>, then
              enable the repositories Metis should review.
            </li>
          </UL>
        </Step>

        <Step title="Open a pull request" id="first-review">
          <P>
            Open a PR on an enabled repository. Within a minute or two, inline findings start
            appearing on the diff, followed by a summary review and an updated PR description.
            Follow along with <Code>make logs</Code>.
          </P>
        </Step>
      </Steps>

      <H2 id="troubleshooting">Troubleshooting</H2>
      <Table
        head={['Symptom', 'Likely cause']}
        rows={[
          [
            <>
              Webhook deliveries fail with <Code>401 Invalid Webhook Signature</Code>
            </>,
            <>
              <Code>GITHUB_WEBHOOK_SECRET</Code> doesn't match the secret in the GitHub App
              settings.
            </>,
          ],
          [
            <>
              Deliveries return <Code>ignored</Code>: “Repository not enrolled”
            </>,
            'The repository is not enabled yet. Sync and enable it on the Repositories page.',
          ],
          [
            'GitHub shows “redirect_uri is not associated with this application”',
            <>
              The app's callback URL must be exactly <Code>{'<FRONTEND_URL>/auth/callback'}</Code>.
            </>,
          ],
          [
            'The API exits on startup with a validation error',
            <>
              A required variable is missing from <Code>backend/.env</Code>. The error names it.
            </>,
          ],
          [
            'Reviews start, then fail',
            <>
              Check the <Code>worker</Code> logs. The usual causes are an invalid LLM or Daytona
              key, or a <Code>MODEL_NAME</Code> that doesn't support tool calling.
            </>,
          ],
        ]}
      />

      <H2 id="without-docker">Running without Docker</H2>
      <P>
        For development on Metis itself, run the infrastructure in Docker and the app processes
        natively. You need Python 3.10+, uv, Node.js 20+, and pnpm.
      </P>
      <CodeBlock code={WITHOUT_DOCKER} />
      <P>
        In this mode, the values in <Code>backend/.env</Code> are used as-is. The defaults in{' '}
        <Code>.env.example</Code> already point at <Code>localhost</Code>. Set{' '}
        <Code>GITHUB_SECRET_KEY_PATH</Code> to your key's path relative to <Code>backend/</Code>.
      </P>

      <H2 id="production">Going to production</H2>
      <P>
        <Code>docker-compose.dev.yml</Code> is meant for development: it runs the dashboard dev
        server and uses default database passwords. For a long-lived deployment:
      </P>
      <UL>
        <li>
          Build the API and worker from <Code>backend/Dockerfile</Code>. Both use the same image:
          the worker runs <Code>celery -A app.core.celery_app worker</Code>, and the API runs{' '}
          <Code>alembic upgrade head</Code> before <Code>uvicorn</Code>.
        </li>
        <li>
          Build the dashboard with the <Code>production</Code> target of{' '}
          <Code>frontend/Dockerfile</Code>, passing <Code>VITE_API_URL</Code> as a build argument.
          It serves static files with nginx on port 8080.
        </li>
        <li>Use managed or properly secured PostgreSQL and Redis, with strong credentials.</li>
        <li>
          Serve the dashboard and API over HTTPS, on subdomains of the same domain (for example{' '}
          <Code>app.example.com</Code> and <Code>api.example.com</Code>). Session cookies are{' '}
          <Code>SameSite=Lax</Code>, so they are only sent when both share a site.
        </li>
        <li>
          Set <Code>FRONTEND_URL</Code> to the dashboard's public URL. It controls CORS and the
          OAuth redirect. Update the GitHub App's callback and webhook URLs to match.
        </li>
      </UL>
    </>
  );
}
