# State Machines

This document defines allowed transitions for `TASK` and `work_session`.

## TASK State Machine

States:
- `draft`
- `ready`
- `in_progress`
- `validated`
- `done`
- `stale`
- `blocked`
- `failed_validation`

Allowed transitions:
- `draft` -> `ready`, `blocked`
- `ready` -> `in_progress`, `blocked`, `stale`
- `in_progress` -> `validated`, `failed_validation`, `blocked`, `stale`
- `validated` -> `done`, `failed_validation`, `stale`
- `done` -> `stale`
- `failed_validation` -> `in_progress`, `blocked`, `stale`
- `blocked` -> `ready`, `in_progress`, `stale`
- `stale` -> `ready`, `blocked`

Diagram:
```text
draft -> ready -> in_progress -> validated -> done
   \       \           \            \        \
    \       -> blocked   -> failed_validation  -> stale
     \                    \                     /
      --------------------> stale -------------

failed_validation -> in_progress
blocked -> ready | in_progress
stale -> ready | blocked
```

## work_session State Machine

States:
- `opened`
- `active`
- `closed`

Allowed transitions:
- `opened` -> `active`, `closed`
- `active` -> `closed`
- `closed` -> (none)

Diagram:
```text
opened -> active -> closed
   \--------------->/
```
