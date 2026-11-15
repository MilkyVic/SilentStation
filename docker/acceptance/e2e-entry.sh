#!/bin/sh
set -eu
mkdir -p /home/pwuser/.pki/nssdb /evidence
chown -R pwuser:pwuser /home/pwuser/.pki /evidence
runuser -u pwuser -- certutil -N -d sql:/home/pwuser/.pki/nssdb --empty-password
runuser -u pwuser -- certutil -A -d sql:/home/pwuser/.pki/nssdb -n silentstation-acceptance -t 'C,,' -i /run/ca/ca.crt
export NODE_EXTRA_CA_CERTS=/run/ca/ca.crt
exec runuser -u pwuser -- node ./node_modules/@playwright/test/cli.js test --config=tests/acceptance/playwright.config.ts
