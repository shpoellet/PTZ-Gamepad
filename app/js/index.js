
var buttons_html = '';

for (var i = 0; i < 8; i++) {
  buttons_html = buttons_html + '<div class="camera_select_button" id="CAMERA_SELECT_' +i+ '" onclick="CameraSelectButton(' + i + ')">'+(i+1)+'</div>';
}
document.getElementById("CAMERA_BUTTONS").innerHTML=buttons_html;

buttons_html = '';

for (var i = 0; i < 32; i++) {
  buttons_html = buttons_html + '<div class="preset_button preset_select_button" id="PRESET_SELECT_' + i +'" onclick="PresetSelectButton(' + i + ')">'+(i+1)+'</div>';
}
document.getElementById("PRESET_BUTTONS").innerHTML=buttons_html;



//Page Navigation Page Clicks

document.getElementById("SETTINGS_GEAR").onmousedown = function(){
  document.getElementById("SETTINGS_MASK_PANE").style.display = 'block';
  document.getElementById("SETTINGS_PANE").style.display = 'block';
}

function closeSettingsPane(){
  document.getElementById("SETTINGS_MASK_PANE").style.display = 'none';
  document.getElementById("SETTINGS_PANE").style.display = 'none';
}
