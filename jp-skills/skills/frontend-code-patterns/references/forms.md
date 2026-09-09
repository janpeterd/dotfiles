# Forms

Make a Zod schema the validation source and derive form input and output types from it. Let a focused hook own TanStack Form setup, schema validation, normalization, and submission orchestration.

Render forms through the shared form layout and action components. Give reusable forms typed `onSubmit` and `onCancel` callbacks. The caller owns mutations, navigation, dialogs, and success behavior.

Initialize form state from props. When a different record must reset the entire form, give the form subtree a stable record key. Keep user-driven changes in event handlers instead of synchronizing props into form state with an Effect.
