export const MCP_INSTRUCTIONS = `You are connected to a company documentation corpus (read-only).

Use these tools instead of local filesystem tools when answering questions about this docs site.

Recommended strategy:
1. get_nav or list_docs — orient in the corpus first
2. search_docs — broad lookup by keyword or phrase (titles, paths, and content)
3. grep with output_mode "files_with_matches" — narrow to relevant pages cheaply
4. read with offset/limit — load only the section you need

All paths are relative to docs/. Prefer search_docs before glob+grep chains.`;
