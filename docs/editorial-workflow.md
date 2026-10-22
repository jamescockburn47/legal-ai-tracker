# Editorial publication workflow

Daily scans now stage proposals only. `/api/ingest` never publishes, including when called by the owner. `/api/overview` also stages. `/api/editorial` accepts topic drafts; only the signed-in owner, using the same-origin editorial desk, can approve or reject. Currency changes keep their separate owner approval gate.

The daily automation returns an approval report in ChatGPT with individual proposal IDs and the editorial desk link. Owner approval email is not enabled. Subscriber digests use only published records, never drafts.

Record expansions have separate background and commentary fields. Commentary is editorial analysis, not a statement that a regulator imposed additional obligations. Existing short notes remain until their expanded versions are approved.

Topic briefings preserve approved versions and change reasons. Their public response flags later changes to records sharing a topic; this is a review prompt, not an inference that the legal position changed. Source checks older than 14 days are labelled review due. The collector must assess affected articles and submit substantive revisions for approval. No public AI search is enabled.

Approval compares the current publication with the snapshot at drafting and refuses stale proposals. Approval operations claim a proposal before writing; a failed or ambiguous operation is marked Needs attention, not blindly retried. A future admin remediation workflow is needed for such exceptional failures.

Task filters use an explicit topic mapping rather than claiming individual source-level task classification. Role, task and other search filters intersect and persist in saved alerts.

Research models: Practical Law's maintained practice notes/resource histories, Law Society of South Australia's task-based AI implementation resources, IAPP's jurisdiction/status tracker. Only structural ideas and public descriptions are used; no protected collections are reproduced.
