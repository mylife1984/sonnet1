//Thanks: http://extjs.com/forum/showthread.php?t=38059
function TinyMCEFileBrowser(field_name, url, type, win) {
	var chooser = new divo.win.ImageChooserWindow({
		width : 815,
		height : 500
	})
	chooser.showWindow(field_name, function(imageSrcEl, data) {
		// insert information now
		win.document.getElementById(imageSrcEl).value = data.url
		win.document.getElementById('alt').value = data.title
		// for image browsers: update image dimensions
		if (win.ImageDialog.getImageData)
			win.ImageDialog.getImageData()
		if (win.ImageDialog.showPreviewImage)
			win.ImageDialog.showPreviewImage(data.url)
	})
	return false;
}	
//EOP

