Set WshShell = WScript.CreateObject("WScript.Shell") 
WshShell.AppActivate("Google Chrome")
WScript.Sleep 500
WshShell.SendKeys "{TAB}" 
WScript.Sleep 100
WshShell.SendKeys "{F5}" 