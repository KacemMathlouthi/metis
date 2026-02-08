export type ToolCall = {
  id?: string;
  function?: {
    name?: string;
    arguments?: string;
  };
};

export type TimelineEntry = {
  role?: string;
  content?: unknown;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
};

export type ParsedToolPayload = {
  success?: boolean;
  data?: Record<string, unknown> | null;
  error?: string | null;
  metadata?: Record<string, unknown> | null;
};
