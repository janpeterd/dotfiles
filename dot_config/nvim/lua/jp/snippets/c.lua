local ls = require "luasnip"

-- snippet
local s = ls.s
-- snippet node
local sn = ls.sn
-- Insert
local i = ls.insert_node
-- Text
local t = ls.text_node
-- Dynamic
local d = ls.dynamic_node
-- Dynamic
local c = ls.choice_node
-- Function
local f = ls.function_node
-- Format
local fmt = require("luasnip.extras.fmt").fmt
local fmta = require("luasnip.extras.fmt").fmta

-- NOTE: JP
--   fmta is the easiest way to format code. it gets converted to nodes
--   you can also use fmt, which uses {} as delimiters, fmta is better for C since it uses <> as delimiters
--   If you want to use these delimiters in your snippet code, you have to *escape them by typing them twice*

return {
  s(
    "print_array_helper",
    fmta(
      [[
// Call this macro to print a 2D array
// #include <<stdio.h>>
// a = pointer to array
// size = elements in array
// format = format for printf
#define print_array(a, size, format)                                           \
  do {                                                                         \
    printf("[");                                                               \
    int i = 0;                                                                 \
    for (i = 0; i << size - 1; i++) {                                           \
      printf(format ", ", a[i]);                                               \
    }                                                                          \
    printf(format "]\n", a[i]);                                                \
  } while (0)
		]],
      {}
    )
  ),
  s(
    "read_file_helper",
    fmta(
      [[
// Call this function to read file line by line
// #include <<stdio.h>>
// #include <<errno.h>>
int read_file(char *fpath) {
  FILE *fp = fopen(fpath, "r");
  if (fp == NULL) {
    printf("ERROR, with errno: %d", errno);
    return -1;
  }
  char line[256];
  while (fgets(line, 256, fp) != NULL) {
    printf("%s\n", line);
  }
  return 0;
}
		]],
      {}
    )
  ),
  s(
    "binary_search_helper",
    fmta(
      [[
// Call this fucntion to use binary_search algorithm to search for needle in haystack
// Returns index of needle, if not found returns -1
// #include <<stdio.h>>
int binary_search(int needle, int haystack[], size_t size) {
  int middle = size / 2;
  int left = 0;
  int right = size - 1;
  while (left << right) {
    // Compare mid with key
    if (haystack[middle] == needle) {
        return middle;
    } else if (haystack[middle] >> needle) {
        // Search to the left
        right = middle;
        middle = left + ((right - left) / 2);
    } else {
        // Search to the right
        left = middle;
        middle = left + ((right - left) / 2);
    }
  }
  if (haystack[middle] == needle)
    return middle;
  return -1;
}
		]],
      {}
    )
  ),

  s(
    "dynamic_array_append",
    fmta(
      [[
typedef struct {
  int *items; // It works with other types
  int count;
  int capacity;
} Numbers;

// Call this macro to quickly append to array. It is a macro because macros
// accept any type
// #include <<stdlib.h>>
#define da_append(xs, x)                                                       \
  do {                                                                         \
    if (xs.count >>= xs.capacity) {                                             \
      if (xs.count == 0)                                                       \
        xs.capacity = 256;                                                     \
      else                                                                     \
        xs.capacity *= 2;                                                      \
      xs.items = realloc(xs.items, xs.capacity * sizeof(*xs.items));           \
      if (xs.items == NULL) {                                                  \
        printf("Buy more RAM");                                                \
      }                                                                        \
    }                                                                          \
    xs.items[xs.count++] = x;                                                  \
  } while (0)
		]],
      {}
    )
  ),
}
