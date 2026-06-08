import sys, os, subprocess, builtins, types, threading, signal

subprocess.run = lambda *a, **kw: types.SimpleNamespace(stdout='', stderr='', returncode=0)
os.system = lambda cmd: 0
signal.signal = lambda *a: None

threading.Thread.start = lambda self, *a, **kw: builtins.print("[Web] threading disabled")

import version_checker as _vc
_vc.check_for_update = lambda: (None, False)
_vc.perform_update = lambda: None
_vc.restart_app = lambda: None

import keys
keys.load_keys = lambda: {}
keys.save_keys = lambda k: None
keys.configure_keys = lambda: None
keys.get_or_prompt_key = lambda *a, **kw: ''

import data_loader as _dl

def _web_input(prompt=''):
    import _stdin_bridge
    if prompt:
        _stdin_bridge.write_prompt(prompt)
    return _stdin_bridge.read()

builtins.input = _web_input

def start():
    builtins.print("[Web] Dojical starting...")
    import main as _main
    _main.run()
