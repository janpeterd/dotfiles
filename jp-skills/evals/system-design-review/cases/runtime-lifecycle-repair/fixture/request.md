# Runtime behavior

The application starts one required worker and one optional worker. It becomes ready only after the required worker starts. Optional startup failures remain visible. Every started worker stops during normal shutdown and partial startup failure.
