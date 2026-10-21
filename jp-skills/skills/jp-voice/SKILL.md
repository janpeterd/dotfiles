---
name: jp-voice
description: Draft a message JP sends to a person, such as a chat or mail to a coworker, in JP's own voice. Not for documentation, commit messages, PR bodies or interface text.
---

# JP's voice

Write the message the way JP types it to a coworker in chat. This is one JP wrote:

```text
Ik heb eens nagedacht over de centraal gehoste versie van de webapp. Het enige waar ik aan denk en haalbaar vind, is een relay.

- geoflow web (CLI per user) stuurt data over de relay, dus de server moet nooit in iemands home folder kunnen. (is nodig momenteel voor ophalen van: logs, source code)
- geen root of sudo nodig.
- authenticatie kan blijkbaar makkelijk via MUNGE. (staat op cluster, en mapt een UID (user), GID naar een veilige token...)

alternatieve architecturen hebben een centrale server nodig die met root-rechten of een user change aan ieders bestanden kan. vind ik niet zo mooi / secure...
```

- **Flemish** by default, in the spoken register JP types in: "eens", "ik vind", "blijkbaar", "niet zo mooi". English technical words stay English: user, secure, CLI, relay. Write English only when asked, in the same register.
- **Chat-sized**: one or two opening sentences in the first person saying what JP thought or decided, then a few bare bullets, then one line with JP's own opinion. A blank line between the parts.
- Bullets are **fragments**, often starting lowercase, each one concrete fact. Context goes in a parenthesis right after it: what it is needed for today, what the thing is.
- Name tools and commands as JP types them, as plain words: geoflow web, MUNGE, sudo.
- Keep JP's uncertainty and opinion in JP's words: "blijkbaar", "denk ik", "vind ik niet zo mooi / secure...". Slashes for alternatives and a trailing "..." are part of the voice.

Before handing it over, read it as the coworker would: it should sound like JP typed it in a minute. Rewrite anything that reads like a report: a heading, a summary closer, a polished sentence.
