#!/bin/sh
set -eu
umask 077
for name in database_url auth_secret cron_secret; do
 if [ -e /runtime/"$name" ]; then cmp -s /source/"$name" /runtime/"$name" || exit 1
 else cp /source/"$name" /runtime/"$name"; fi
 chown 1000:1000 /runtime/"$name"; chmod 400 /runtime/"$name"
done
if [ -e /database/db_password ]; then cmp -s /source/db_password /database/db_password || exit 1
else cp /source/db_password /database/db_password; fi
chown "$(id -u postgres):$(id -g postgres)" /database/db_password; chmod 400 /database/db_password
chmod 755 /runtime /database
echo 'Project secret volumes initialized; no values printed.'
