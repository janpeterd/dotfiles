The device editor has drifted into three representations of the same form data. Validation rules, the TypeScript value shape, and the API payload can now disagree. The component also performs its own mutation and navigation, which makes the create and edit screens behave differently.

Refactor the editor so create and edit flows can share it safely. Keep the tested normalization and payload behavior, preserve the current fields, and use the form and validation libraries already listed in `package.json`. The caller must remain free to choose what successful submission and cancellation do.
