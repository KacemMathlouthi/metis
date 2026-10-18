import type React from 'react';
import { CodeBlock } from '@/components/ui/CodeBlock';
import {
  A,
  Callout,
  Code,
  DocTitle,
  H2,
  H3,
  Lead,
  P,
  Table,
  UL,
} from '@/components/documentation/Prose';

interface EnvVar {
  name: string;
  /** `true` when the backend refuses to start (or cannot work) without it. */
  required: boolean;
  defaultValue?: string;
  description: React.ReactNode;
}

function EnvTable({ vars }: { vars: readonly EnvVar[] }) {
  return (
    <Table
      head={['Variable', 'Required', 'Default', 'Description']}
      rows={vars.map((envVar) => [
        <Code>{envVar.name}</Code>,
        envVar.required ? <strong>Yes</strong> : 'No',
        envVar.defaultValue ? <Code>{envVar.defaultValue}</Code> : '—',
        envVar.description,
      ])}
    />
  );
}

const GITHUB_VARS: readonly EnvVar[] = [
  { name: 'GITHUB_APP_ID', required: true, description: 'Numeric App ID of your GitHub App.' },
  {
    name: 'GITHUB_CLIENT_ID',
    required: true,
    description: 'OAuth Client ID of the app, used for “Login with GitHub”.',
  },
  {
    name: 'GITHUB_CLIENT_SECRET_ID',
    required: true,
    description: 'OAuth client secret of the app.',
  },
  {
    name: 'GITHUB_WEBHOOK_SECRET',
    required: true,
    description: 'Secret used to verify webhook signatures. Deliveries are rejected without it.',
  },
  {
    name: 'GITHUB_SECRET_KEY_PATH',
    required: true,
    description: 'Path to the app’s private key (.pem). Docker Compose sets this for you.',
  },
];

const LLM_VARS: readonly EnvVar[] = [
  {
    name: 'MODEL_NAME',
    required: true,
    defaultValue: 'vertex_ai/zai-org/glm-4.7-maas',
    description: (
      <>
        A <A href="https://docs.litellm.ai/docs/providers">LiteLLM model string</A>. The prefix
        selects the provider. The model must support tool calling.
      </>
    ),
  },
  {
    name: 'VERTEX_PROJECT',
    required: false,
    description: 'Google Cloud project ID. Vertex AI only.',
  },
  {
    name: 'VERTEX_LOCATION',
    required: false,
    description: (
      <>
        Vertex AI region. Gemini 3 models need <Code>global</Code>.
      </>
    ),
  },
];

const APP_VARS: readonly EnvVar[] = [
  {
    name: 'FRONTEND_URL',
    required: true,
    description:
      'Public URL of the dashboard. Used for CORS, the OAuth redirect, and links in review comments.',
  },
  {
    name: 'JWT_SECRET_KEY',
    required: true,
    description: 'Random secret that signs session tokens.',
  },
  {
    name: 'JWT_ACCESS_TOKEN_EXPIRE_MINUTES',
    required: false,
    defaultValue: '60',
    description: 'Lifetime of the access token cookie.',
  },
  {
    name: 'JWT_REFRESH_TOKEN_EXPIRE_DAYS',
    required: false,
    defaultValue: '7',
    description: 'Lifetime of the refresh token cookie.',
  },
  {
    name: 'ENCRYPTION_KEY',
    required: true,
    description:
      'Fernet key that encrypts users’ GitHub tokens in the database. Changing it invalidates stored tokens.',
  },
];

const DATA_VARS: readonly EnvVar[] = [
  {
    name: 'DATABASE_URL',
    required: true,
    description: (
      <>
        Async SQLAlchemy URL, e.g. <Code>postgresql+asyncpg://user:pass@host:5432/metis</Code>.
      </>
    ),
  },
  {
    name: 'DATABASE_POOL_SIZE',
    required: false,
    defaultValue: '20',
    description: 'Connections kept open per process.',
  },
  {
    name: 'DATABASE_MAX_OVERFLOW',
    required: false,
    defaultValue: '10',
    description: 'Extra connections allowed under load.',
  },
  {
    name: 'REDIS_URL',
    required: true,
    description: (
      <>
        Redis connection URL, e.g. <Code>redis://localhost:6379/0</Code>.
      </>
    ),
  },
  {
    name: 'CELERY_BROKER_URL',
    required: true,
    description: 'Redis URL the worker pulls jobs from.',
  },
  {
    name: 'CELERY_RESULT_BACKEND',
    required: true,
    description: 'Redis URL for task results. Use a separate database number from the broker.',
  },
  {
    name: 'CELERY_TASK_TIME_LIMIT',
    required: false,
    defaultValue: '600',
    description:
      'Default hard time limit in seconds. Agent tasks set their own, longer hard limits.',
  },
  {
    name: 'CELERY_TASK_SOFT_TIME_LIMIT',
    required: false,
    defaultValue: '540',
    description:
      'Soft time limit in seconds, applied to every task. Raise it if reviews of very large PRs get cut off.',
  },
];

const DAYTONA_VARS: readonly EnvVar[] = [
  { name: 'DAYTONA_API_KEY', required: true, description: 'API key from your Daytona dashboard.' },
  {
    name: 'DAYTONA_API_URL',
    required: true,
    description: (
      <>
        API endpoint, e.g. <Code>https://app.daytona.io/api</Code> for Daytona Cloud.
      </>
    ),
  },
  {
    name: 'DAYTONA_TARGET',
    required: true,
    description: (
      <>
        Region where sandboxes run, e.g. <Code>us</Code> or <Code>eu</Code> on Daytona Cloud.
      </>
    ),
  },
];

const LANGSMITH_VARS: readonly EnvVar[] = [
  {
    name: 'LANGSMITH_TRACING',
    required: false,
    defaultValue: 'true',
    description: (
      <>
        Sends every LLM call to LangSmith. Set to <Code>false</Code> if you don’t use it.
      </>
    ),
  },
  { name: 'LANGSMITH_API_KEY', required: false, description: 'LangSmith API key.' },
  {
    name: 'LANGSMITH_PROJECT',
    required: false,
    description: 'LangSmith project that traces are grouped under.',
  },
  {
    name: 'LANGSMITH_ENDPOINT',
    required: false,
    description: 'Override for self-hosted LangSmith.',
  },
];

const PROVIDER_EXAMPLES = `
# OpenAI
MODEL_NAME=gpt-4o
OPENAI_API_KEY=sk-...

# Anthropic
MODEL_NAME=anthropic/claude-sonnet-5-5
ANTHROPIC_API_KEY=sk-ant-...

# Mistral
MODEL_NAME=mistral/mistral-large-latest
MISTRAL_API_KEY=...

# Azure OpenAI (the part after azure/ is your deployment name)
MODEL_NAME=azure/my-gpt-4o-deployment
AZURE_API_KEY=...
AZURE_API_BASE=https://my-resource.openai.azure.com
AZURE_API_VERSION=2024-10-21

# Google Vertex AI
MODEL_NAME=vertex_ai/gemini-3-flash-preview
VERTEX_PROJECT=my-gcp-project
VERTEX_LOCATION=global
`;

const SELF_HOSTED_DAYTONA = `
git submodule update --init daytona
cd daytona
docker compose -f docker/docker-compose.yaml up -d
# dashboard on http://localhost:3000 (dev@daytona.io / password)
`;

export function ConfigurationPage() {
  return (
    <>
      <DocTitle eyebrow="Reference">Configuration</DocTitle>
      <Lead>
        The API and the worker read the same settings, from environment variables or from{' '}
        <Code>backend/.env</Code>. Variable names are case-insensitive. Start from{' '}
        <Code>backend/.env.example</Code>.
      </Lead>

      <H2 id="github">GitHub App</H2>
      <P>
        See <A href="/docs/github-app">Create the GitHub App</A> for where each value comes from.
      </P>
      <EnvTable vars={GITHUB_VARS} />

      <H2 id="llm">LLM provider</H2>
      <P>
        Metis calls models through <A href="https://docs.litellm.ai">LiteLLM</A>, so switching
        providers is a configuration change. Set <Code>MODEL_NAME</Code>, then add the credentials
        that provider expects. LiteLLM reads them straight from the environment or from{' '}
        <Code>backend/.env</Code>.
      </P>
      <EnvTable vars={LLM_VARS} />
      <CodeBlock code={PROVIDER_EXAMPLES} title="backend/.env — pick one" />
      <H3 id="vertex-credentials">Vertex AI credentials</H3>
      <UL>
        <li>
          <strong>Running natively:</strong> run <Code>gcloud auth application-default login</Code>{' '}
          once.
        </li>
        <li>
          <strong>Docker Compose:</strong> save a service account key with the Vertex AI User role
          as <Code>backend/secrets/gcp-sa.json</Code>. It is mounted into the API and worker, and{' '}
          <Code>GOOGLE_APPLICATION_CREDENTIALS</Code> points at it.
        </li>
      </UL>
      <Callout>
        <p>
          Agents work through tool calls, so pick a model with solid function-calling support.
          Smaller models often stop early or call tools with invalid arguments.
        </p>
      </Callout>

      <H2 id="app">Application & security</H2>
      <EnvTable vars={APP_VARS} />
      <P>Generate the two secrets with:</P>
      <CodeBlock
        code={
          "openssl rand -hex 32                       # JWT_SECRET_KEY\nopenssl rand -base64 32 | tr '+/' '-_'     # ENCRYPTION_KEY"
        }
      />

      <H2 id="data">Database, Redis & Celery</H2>
      <P>
        Docker Compose sets these for you. You only need them when you run the processes yourself or
        point Metis at managed services.
      </P>
      <EnvTable vars={DATA_VARS} />

      <H2 id="daytona">Daytona sandboxes</H2>
      <P>
        Every agent run gets a fresh sandbox. Metis clones the repository into it, the agent's tools
        run inside it, and the sandbox is deleted when the run ends.
      </P>
      <EnvTable vars={DAYTONA_VARS} />
      <H3 id="self-hosted-daytona">Self-hosting Daytona</H3>
      <P>
        The repository includes Daytona as a submodule, with a Compose setup for running it locally:
      </P>
      <CodeBlock code={SELF_HOSTED_DAYTONA} />
      <P>
        Create an API key in that dashboard and set <Code>DAYTONA_API_URL</Code> to{' '}
        <Code>http://localhost:3000/api</Code>. If the Metis worker runs in a container, use{' '}
        <Code>host.docker.internal</Code> instead of <Code>localhost</Code>. Daytona's stack also
        uses port 5050 for pgAdmin, so stop the Metis pgAdmin or remap one of them. See the{' '}
        <A href="https://www.daytona.io/docs">Daytona docs</A> for production setups.
      </P>

      <H2 id="tracing">Tracing (optional)</H2>
      <EnvTable vars={LANGSMITH_VARS} />
      <Callout type="warning">
        <p>
          Tracing is <strong>on by default</strong>. If you don’t have a LangSmith account, set{' '}
          <Code>LANGSMITH_TRACING=false</Code>. Otherwise every LLM call tries to export a trace.
        </p>
      </Callout>

      <H2 id="repository-settings">Per-repository review settings</H2>
      <P>
        Review behavior is configured per repository from the dashboard's <strong>AI Review</strong>{' '}
        page, not through environment variables:
      </P>
      <UL>
        <li>
          <strong>Sensitivity</strong>: <Code>LOW</Code> flags only critical bugs, security holes,
          and data-corruption risks. <Code>MEDIUM</Code> (the default) covers the few most important
          bugs, security, and error-handling problems. <Code>HIGH</Code> adds performance, design,
          and missing tests.
        </li>
        <li>
          <strong>Custom instructions</strong>: free text added to the reviewer's instructions, such
          as team conventions or areas to focus on.
        </li>
        <li>
          <strong>Ignore patterns</strong>: file patterns the reviewer skips, such as{' '}
          <Code>*.lock</Code> or <Code>migrations/**</Code>.
        </li>
      </UL>
    </>
  );
}
