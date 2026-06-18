!macro customInstall
  File /oname=$PLUGINSDIR\ketel-mail-install-movie.hta "${BUILD_RESOURCES_DIR}\ketel-mail-install-movie.hta"
  ExecWait '"mshta.exe" "$PLUGINSDIR\ketel-mail-install-movie.hta"'
!macroend
