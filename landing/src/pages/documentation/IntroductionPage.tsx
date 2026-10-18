import {
  A,
  Callout,
  Code,
  DocTitle,
  H2,
  Lead,
  P,
  Table,
  UL,
} from '@/components/documentation/Prose';
import { REPO_URL } from '@/site';

export function IntroductionPage() {
  return (
    <>
      <DocTitle eyebrow="Docs">Introduction</DocTitle>
      <Lead>
        Metis is an AI code reviewer that runs as your own GitHub App. It reviews pull requests,
        writes PR summaries, and can turn a GitHub issue into a pull request. These docs explain how
        to run it on your own infrastructure.
      </Lead>

      <H2 id="what-metis-does">What Metis does</H2>
      <UL>
        <li>
          <strong>Pull request reviews.</strong> When a PR is opened, reopened, or receives new
          commits, an agent checks out the branch in an isolated sandbox, explores the code, and
          posts findings inline on the diff. Each finding has a severity (<Code>INFO</Code>,{' '}
          <Code>WARNING</Code>, <Code>ERROR</Code>, <Code>CRITICAL</Code>) and a category such as{' '}
          <Code>BUG</Code>, <Code>SECURITY</Code>, or <Code>PERFORMANCE</Code>. A final review with
          a verdict (approve, request changes, or comment) closes it out.
        </li>
        <li>
          <strong>PR summaries.</strong> A second agent runs at the same time. It rewrites the PR
          title and appends a summary of the change to the PR description.
        </li>
        <li>
          <strong>Issue → PR.</strong> From the dashboard, you can launch a coding agent on any
          issue. It branches, edits code, runs tests, commits, pushes, and opens a PR.
        </li>
        <li>
          <strong>Dashboard.</strong> A web app where you sign in with GitHub, choose which
          repositories Metis reviews, tune review settings, and browse findings and agent runs.
        </li>
      </UL>

      <H2 id="what-you-run">What you run</H2>
      <P>A self-hosted Metis deployment has five services of its own:</P>
      <Table
        head={['Service', 'What it does']}
        rows={[
          [
            <strong>API</strong>,
            'FastAPI app. Receives GitHub webhooks, serves the dashboard API, handles GitHub sign-in.',
          ],
          [<strong>Worker</strong>, 'Celery worker. Runs the review, summary, and coding agents.'],
          [<strong>Dashboard</strong>, 'React single-page app for configuration and analytics.'],
          [
            <strong>PostgreSQL</strong>,
            'Stores users, enrolled repositories, reviews, findings, and agent runs.',
          ],
          [<strong>Redis</strong>, 'Job queue between the API and the worker.'],
        ]}
      />
      <P>It also relies on three external services that you bring your own credentials for:</P>
      <Table
        head={['Service', 'Why it is needed']}
        rows={[
          [
            <strong>GitHub App</strong>,
            'You register your own app. It delivers webhooks and lets Metis read code and post reviews.',
          ],
          [
            <strong>LLM provider</strong>,
            'Any provider supported by LiteLLM: Vertex AI, OpenAI, Anthropic, Mistral, Azure OpenAI, and more.',
          ],
          [
            <strong>Daytona</strong>,
            'Creates the sandboxes where agents clone and run code. Use Daytona Cloud or host it yourself.',
          ],
        ]}
      />

      <H2 id="requirements">Requirements</H2>
      <UL>
        <li>
          <strong>Docker</strong> with Docker Compose, to run the stack the easy way. To run without
          containers you need Python 3.10+, <A href="https://docs.astral.sh/uv/">uv</A>, Node.js
          20+, and pnpm.
        </li>
        <li>A GitHub account (personal or organization) that can create GitHub Apps.</li>
        <li>An API key for an LLM provider, or a Google Cloud project with Vertex AI enabled.</li>
        <li>
          A <A href="https://app.daytona.io">Daytona</A> API key.
        </li>
        <li>
          A public HTTPS URL that reaches the API, so GitHub can deliver webhooks. On a laptop, a
          tunnel such as <Code>ngrok</Code> or <Code>cloudflared</Code> is enough.
        </li>
      </UL>

      <Callout>
        <p>
          Metis is MIT-licensed and developed in the open at{' '}
          <A href={REPO_URL}>KacemMathlouthi/metis</A>. Issues and pull requests are welcome.
        </p>
      </Callout>

      <H2 id="next-steps">Next steps</H2>
      <UL>
        <li>
          <A href="/docs/quickstart">Quickstart</A>: run the whole stack with Docker Compose.
        </li>
        <li>
          <A href="/docs/github-app">GitHub App</A>: register the app Metis acts through.
        </li>
        <li>
          <A href="/docs/configuration">Configuration</A>: every environment variable and LLM
          provider setup.
        </li>
        <li>
          <A href="/docs/architecture">Architecture</A>: how a webhook becomes a review.
        </li>
      </UL>
    </>
  );
}
