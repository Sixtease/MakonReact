#!/bin/bash

npm run build || exit 1
rm -rf \
  ~/zdrojaky/python/app_engine/makonreact/assets/ \
  ~/zdrojaky/python/app_engine/makonreact/static/ \
  ~/zdrojaky/python/app_engine/makonreact/index.html \
  ~/zdrojaky/python/app_engine/makonreact/asset-manifest.json
cp -R dist/* ~/zdrojaky/python/app_engine/makonreact/
#~/share/install/google/app_engine/google_appengine_1.9.19/appcfg.py --oauth2 update ~/zdrojaky/python/app_engine/makonreact
gcloud app deploy ~/zdrojaky/python/app_engine/makonreact --project=makonreact
