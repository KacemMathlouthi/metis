import { ArrowDown, ArrowRight } from 'lucide-react';
import {
  A,
  Code,
  DocTitle,
  H2,
  H3,
  Lead,
  OL,
  P,
  Table,
  UL,
} from '@/components/documentation/Prose';
import { cn } from '@/lib/utils';
import { REPO_URL } from '@/site';

interface NodeProps {
  title: string;
  detail: string;
  tone?: 'external' | 'core' | 'data';
}

const NODE_TONES = {
  external: 'bg-white',
  core: 'bg-[var(--metis-pastel-2)]',
  data: 'bg-[var(--metis-pastel-3)]',
} as const;

function FlowNode({ title, detail, tone = 'core' }: NodeProps) {
  return (
    <div
      className={cn(
        'flex-1 border-4 border-black p-3 text-center shadow-[4px_4px_0px_0px_#000]',
        NODE_TONES[tone]
      )}
    >
      <p className="font-display text-base font-black uppercase">{title}</p>
      <p className="mt-1 text-xs font-semibold text-black/70">{detail}</p>
    </div>
  );
}

function FlowArrow({ label }: { label: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center justify-center px-1 py-1 text-[0.7rem] font-bold text-black/70 md:w-20">
      <ArrowDown className="h-5 w-5 md:hidden" aria-hidden="true" />
      <ArrowRight className="hidden h-5 w-5 md:block" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

function SystemDiagram() {
  return (
    <figure className="my-8 border-4 border-black bg-[var(--metis-cream)] p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-stretch">
        <FlowNode title="GitHub" detail="PR webhook" tone="external" />
        <FlowArrow label="HTTPS" />
        <FlowNode title="API" detail="FastAPI · verifies & records" />
        <FlowArrow label="enqueue" />
        <FlowNode title="Redis" detail="Celery broker" tone="data" />
        <FlowArrow label="consume" />
        <FlowNode title="Worker" detail="Celery · runs agents" />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <FlowNode title="Dashboard" detail="React · talks to the API" tone="external" />
        <FlowNode title="PostgreSQL" detail="Shared by API & worker" tone="data" />
        <FlowNode title="Daytona" detail="Sandbox per agent run" tone="external" />
        <FlowNode title="LLM" detail="Any provider via LiteLLM" tone="external" />
      </div>
      <figcaption className="mt-4 text-center text-xs font-semibold text-black/60">
        The worker drives the sandbox and the LLM, and posts results back to GitHub.
      </figcaption>
    </figure>
  );
}

const REVIEWER_TOOLS =
  'read_file, list_files, search_files, git_status, git_branches, run_tests, run_linter, run_command, post_inline_finding, post_file_finding, finish_review';
const SUMMARY_TOOLS = 'read_file, list_files, search_files, git_status, finish_summary';
const CODER_TOOLS =
  'read_file, list_files, search_files, replace_in_files, create_file, delete_file, git_status, git_branches, git_create_branch, git_checkout_branch, git_add, git_commit, git_push, git_pull, run_code, run_tests, run_linter, run_command, finish_task';

export function ArchitecturePage() {
  return (
    <>
      <DocTitle eyebrow="Concepts">Architecture</DocTitle>
      <Lead>
        Metis is an event-driven system. A small API responds to GitHub quickly, and a worker does
        the slow part: running LLM agents against your code inside isolated sandboxes.
      </Lead>

      <SystemDiagram />

      <H2 id="review-lifecycle">Lifecycle of a review</H2>
      <OL>
        <li>
          <strong>Webhook.</strong> GitHub sends a <Code>pull_request</Code> event to{' '}
          <Code>/webhooks/github</Code>. The API checks the HMAC-SHA256 signature and ignores
          actions other than <Code>opened</Code>, <Code>reopened</Code>, and{' '}
          <Code>synchronize</Code>.
        </li>
        <li>
          <strong>Enrollment check.</strong> The repository must be enabled in the dashboard. Events
          for other repositories are acknowledged and dropped.
        </li>
        <li>
          <strong>Record and enqueue.</strong> A <Code>Review</Code> row is committed in the{' '}
          <Code>PENDING</Code> state with the PR's metadata. Then two Celery tasks are queued, one
          for the review and one for the summary, and the API responds <Code>202 Accepted</Code>.
        </li>
        <li>
          <strong>Sandbox.</strong> The worker marks the review <Code>PROCESSING</Code>, fetches the
          diff, gets an installation token for the app, and creates a Daytona sandbox with the PR's
          head branch cloned.
        </li>
        <li>
          <strong>Agent loop.</strong> The review agent explores the code and posts each finding to
          GitHub as soon as it is confident in it. Every finding is also saved to the database.
        </li>
        <li>
          <strong>Finish.</strong> The agent calls <Code>finish_review</Code> with a summary and a
          verdict (<Code>APPROVE</Code>, <Code>REQUEST_CHANGES</Code>, or <Code>COMMENT</Code>). The
          worker submits the review, marks it <Code>COMPLETED</Code>, and deletes the sandbox.
        </li>
      </OL>
      <P>
        The summary task runs in parallel with the same setup. When its agent calls{' '}
        <Code>finish_summary</Code>, the worker updates the PR title and appends the summary to the
        description below a <Code>---</Code> separator.
      </P>

      <H2 id="agent-loop">The agent loop</H2>
      <P>All three agents share one small loop. Each iteration:</P>
      <OL>
        <li>sends the conversation so far and the agent's tool schemas to the LLM;</li>
        <li>runs every tool call the model asked for, concurrently, inside the sandbox;</li>
        <li>appends the results to the conversation and goes again.</li>
      </OL>
      <P>
        The loop ends when a completion tool (<Code>finish_review</Code>,{' '}
        <Code>finish_summary</Code>, or <Code>finish_task</Code>) succeeds, or when a limit is hit.
        Review runs are capped at 50 iterations and 100 tool calls. A run that ends without calling
        its completion tool is marked failed, so a half-finished review is never posted as if it
        were complete.
      </P>

      <H3 id="agents-and-tools">Agents and their tools</H3>
      <P>
        Each agent only gets the tools its job needs. The reviewer can run your tests but cannot
        edit files or push.
      </P>
      <Table
        head={['Agent', 'Triggered by', 'Tools']}
        rows={[
          [
            <strong>Reviewer</strong>,
            'PR webhook',
            <span className="font-mono text-xs">{REVIEWER_TOOLS}</span>,
          ],
          [
            <strong>Summary</strong>,
            'PR webhook',
            <span className="font-mono text-xs">{SUMMARY_TOOLS}</span>,
          ],
          [
            <strong>Coder</strong>,
            'Launched from an issue in the dashboard',
            <span className="font-mono text-xs">{CODER_TOOLS}</span>,
          ],
        ]}
      />

      <H2 id="issue-to-pr">Issue → PR</H2>
      <P>
        Launching an agent on an issue creates an <Code>AgentRun</Code> and queues a task. The
        worker loads the issue and repository, opens a sandbox on the default branch, configures git
        with the app's installation token, and runs the coder agent. When the agent calls{' '}
        <Code>finish_task</Code>, the worker checks that the branch exists on GitHub and opens the
        pull request. The full conversation and tool trace are saved, so you can replay the run on
        the dashboard's agent page.
      </P>

      <H2 id="data-model">Data model</H2>
      <Table
        head={['Table', 'Holds']}
        rows={[
          [<Code>users</Code>, 'GitHub users who signed in, with their encrypted OAuth token.'],
          [
            <Code>installations</Code>,
            'One row per enrolled repository: the GitHub installation ID, owner, active flag, and review settings.',
          ],
          [
            <Code>reviews</Code>,
            'One row per reviewed commit: status, PR metadata, summary, verdict, and run metrics.',
          ],
          [
            <Code>review_comments</Code>,
            'Each finding: file, line, severity, category, title, body, and GitHub comment ID.',
          ],
          [
            <Code>agent_runs</Code>,
            'Issue → PR runs: status, metrics, resulting PR, and the full conversation.',
          ],
        ]}
      />

      <H2 id="security">Security model</H2>
      <UL>
        <li>Webhooks are authenticated with HMAC-SHA256 against your webhook secret.</li>
        <li>
          Agent tools run inside Daytona sandboxes, never on the worker host. Each run gets a fresh
          sandbox, deleted afterwards.
        </li>
        <li>
          GitHub access goes through short-lived installation tokens, limited to the permissions and
          repositories you granted the app.
        </li>
        <li>
          Users' OAuth tokens are encrypted at rest with Fernet. Sessions use HTTP-only cookies.
        </li>
        <li>Dashboard APIs only return data for repositories the signed-in user enrolled.</li>
      </UL>
      <P>
        Found a vulnerability? Please follow the{' '}
        <A href={`${REPO_URL}/blob/main/SECURITY.md`}>security policy</A> instead of opening a
        public issue.
      </P>

      <H2 id="source-map">Where to look in the code</H2>
      <Table
        head={['Path', 'Contents']}
        rows={[
          [
            <Code>backend/app/api/</Code>,
            'HTTP routes: webhooks, auth, installations, issues, agents, analytics',
          ],
          [<Code>backend/app/services/webhook.py</Code>, 'Signature check and task dispatch'],
          [<Code>backend/app/tasks/</Code>, 'Celery tasks for reviews, summaries, and Issue → PR'],
          [
            <Code>backend/app/agents/</Code>,
            'Agent loop, agent implementations, prompts, sandbox, tools',
          ],
          [<Code>backend/alembic/</Code>, 'Database migrations'],
          [<Code>frontend/src/</Code>, 'Dashboard (React, TypeScript, Tailwind)'],
        ]}
      />
    </>
  );
}
