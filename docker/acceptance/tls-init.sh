#!/bin/sh
set -eu
umask 077
if [ -s /ca/ca.crt ]; then
 for name in db web mailpit; do openssl verify -CAfile /ca/ca.crt /"$name"/server.crt >/dev/null; done
 echo 'Project certificates already initialized.'; exit 0
fi
openssl req -x509 -newkey rsa:3072 -nodes -days 90 -keyout /private/ca.key -out /ca/ca.crt -subj '/CN=SilentStation acceptance CA' -addext 'basicConstraints=critical,CA:TRUE,pathlen:0' -addext 'keyUsage=critical,keyCertSign,cRLSign' 2>/dev/null
openssl req -x509 -newkey rsa:2048 -nodes -days 30 -keyout /private/untrusted.key -out /ca/untrusted.crt -subj '/CN=Untrusted acceptance CA' 2>/dev/null
chmod 444 /ca/untrusted.crt
for name in db web mailpit; do
 case "$name" in db) san='DNS:db'; owner="$(id -u postgres):$(id -g postgres)";; web) san='DNS:web,DNS:localhost,IP:127.0.0.1'; owner='101:101';; mailpit) san='DNS:mailpit'; owner='1000:1000';; esac
 openssl req -new -newkey rsa:2048 -nodes -keyout /"$name"/server.key -out /tmp/"$name".csr -subj "/CN=$name" 2>/dev/null
 printf 'basicConstraints=critical,CA:FALSE
keyUsage=critical,digitalSignature,keyEncipherment
extendedKeyUsage=serverAuth
subjectAltName=%s
' "$san" > /tmp/"$name".ext
 openssl x509 -req -in /tmp/"$name".csr -CA /ca/ca.crt -CAkey /private/ca.key -CAcreateserial -days 30 -out /"$name"/server.crt -extfile /tmp/"$name".ext 2>/dev/null
 chown "$owner" /"$name"/server.key; chmod 400 /"$name"/server.key; chmod 444 /"$name"/server.crt
 openssl verify -CAfile /ca/ca.crt /"$name"/server.crt >/dev/null
done
chmod 755 /ca /db /web /mailpit; chmod 444 /ca/ca.crt
echo 'Acceptance CA and leaf certificates initialized; no private keys printed.'
