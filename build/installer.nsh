!macro customInstall
  File /oname=$PLUGINSDIR\ketel-mail-install-movie.hta "${BUILD_RESOURCES_DIR}\ketel-mail-install-movie.hta"
  ExecWait '"mshta.exe" "$PLUGINSDIR\ketel-mail-install-movie.hta"'
  CreateShortCut "$SMSTARTUP\Ketel Mail.lnk" "$INSTDIR\Ketel Mail.exe"
!macroend

!macro customUnInstall
  Delete "$SMSTARTUP\Ketel Mail.lnk"
!macroend
