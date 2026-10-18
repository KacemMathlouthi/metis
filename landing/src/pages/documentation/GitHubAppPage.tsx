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

export function GitHubAppPage() {
  return (
    <>
      <DocTitle eyebrow="Self-hosting">Create the GitHub App</DocTitle>
      <Lead>
        Every Metis deployment runs as its own GitHub App. The app receives pull request webhooks,
        lets users sign in, and gives Metis scoped access to the repositories it is installed on.
      </Lead>

      <Steps>
        <Step title="Start a new app" id="new-app">
          <P>
            Open <A href="https://github.com/settings/apps/new">github.com/settings/apps/new</A>, or
            go to <em>Settings → Developer settings → GitHub Apps → New GitHub App</em>. To create
            the app under an organization, use that organization's settings instead.
          </P>
        </Step>

        <Step title="Basic information" id="basic-information">
          <Table
            head={['Field', 'Value']}
            rows={[
              [
                'GitHub App name',
                'Any unique name, e.g. “Metis Reviewer (Acme)”. Reviews are posted under it.',
              ],
              [
                'Homepage URL',
                <>
                  Your dashboard URL, e.g. <Code>http://localhost:5173</Code>
                </>,
              ],
              [
                'Callback URL',
                <>
                  <Code>{'<FRONTEND_URL>/auth/callback'}</Code>, e.g.{' '}
                  <Code>http://localhost:5173/auth/callback</Code>
                </>,
              ],
              ['Expire user authorization tokens', 'Leave the default.'],
              ['Request user authorization (OAuth) during installation', 'Leave unchecked.'],
            ]}
          />
        </Step>

        <Step title="Webhook" id="webhook">
          <P>
            Check <strong>Active</strong>. Set the <strong>Webhook URL</strong> to{' '}
            <Code>{'https://<your-api-host>/webhooks/github'}</Code>. If you don't have a public URL
            yet, enter a placeholder and update it once your tunnel or server is up.
          </P>
          <P>Generate a random webhook secret and paste it into the Webhook secret field:</P>
          <CodeBlock code="openssl rand -hex 32" />
          <P>
            Save the same value as <Code>GITHUB_WEBHOOK_SECRET</Code>. Metis rejects any delivery
            whose HMAC-SHA256 signature doesn't match it.
          </P>
        </Step>

        <Step title="Repository permissions" id="permissions">
          <Table
            head={['Permission', 'Access', 'Used for']}
            rows={[
              [
                'Contents',
                'Read and write',
                'Cloning code into the sandbox; pushing branches for Issue → PR',
              ],
              [
                'Pull requests',
                'Read and write',
                'Reading diffs, posting reviews and inline comments, updating titles and descriptions, opening PRs',
              ],
              ['Issues', 'Read-only', 'Listing issues and loading their details for coding agents'],
              ['Metadata', 'Read-only', 'Mandatory for all GitHub Apps'],
            ]}
          />
          <P>Leave every other permission at “No access”.</P>
        </Step>

        <Step title="Subscribe to events" id="events">
          <P>
            Check <strong>Pull request</strong>. Metis acts on the <Code>opened</Code>,{' '}
            <Code>reopened</Code>, and <Code>synchronize</Code> actions. Other events are
            acknowledged and ignored.
          </P>
        </Step>

        <Step title="Choose where it can be installed" id="visibility">
          <P>
            <strong>Only on this account</strong> is the right choice for a private deployment.
            Choose <strong>Any account</strong> only if other people or organizations will install
            your instance.
          </P>
          <P>
            Click <strong>Create GitHub App</strong>.
          </P>
        </Step>

        <Step title="Collect the credentials" id="credentials">
          <P>On the app's settings page:</P>
          <UL>
            <li>
              Copy the <strong>App ID</strong> and the <strong>Client ID</strong>.
            </li>
            <li>
              Under <em>Client secrets</em>, click <strong>Generate a new client secret</strong> and
              copy it. It is shown only once.
            </li>
            <li>
              Under <em>Private keys</em>, click <strong>Generate a private key</strong>. A{' '}
              <Code>.pem</Code> file downloads.
            </li>
          </UL>
        </Step>

        <Step title="Install the app" id="install">
          <P>
            Click <strong>Install App</strong> in the sidebar, choose the account or organization,
            and select the repositories Metis may access. Installing the app doesn't start reviews
            by itself. You also need to enable each repository in the Metis dashboard.
          </P>
        </Step>
      </Steps>

      <H2 id="environment-variables">Map the values to environment variables</H2>
      <Table
        head={['GitHub App value', 'Variable in backend/.env']}
        rows={[
          ['App ID', <Code>GITHUB_APP_ID</Code>],
          ['Client ID', <Code>GITHUB_CLIENT_ID</Code>],
          ['Client secret', <Code>GITHUB_CLIENT_SECRET_ID</Code>],
          ['Webhook secret', <Code>GITHUB_WEBHOOK_SECRET</Code>],
          ['Private key file path', <Code>GITHUB_SECRET_KEY_PATH</Code>],
        ]}
      />
      <Callout type="warning">
        <p>
          The client secret variable is named <Code>GITHUB_CLIENT_SECRET_ID</Code>, not{' '}
          <Code>GITHUB_CLIENT_SECRET</Code>. Use exactly that name.
        </p>
      </Callout>

      <H2 id="how-it-is-used">How Metis uses the app</H2>
      <UL>
        <li>
          <strong>As the app:</strong> Metis signs a short-lived JWT with your private key and
          exchanges it for an installation token. It uses that token to read diffs, clone code, and
          post reviews.
        </li>
        <li>
          <strong>On behalf of a user:</strong> “Login with GitHub” uses the app's OAuth flow. Metis
          uses the resulting token to find the installations and repositories a user can access. The
          token is encrypted at rest with your <Code>ENCRYPTION_KEY</Code>.
        </li>
      </UL>
      <P>
        Next: fill in the rest of your environment in the{' '}
        <A href="/docs/configuration">configuration reference</A>.
      </P>
    </>
  );
}
