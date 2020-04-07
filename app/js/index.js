
var buttons_html = '';

for (var i = 0; i < 8; i++) {
  buttons_html = buttons_html + '<div class="camera_select_button" id="CAMERA_SELECT_'+i+'">'+(i+1)+'</div>';
}
document.getElementById("CAMERA_BUTTONS").innerHTML=buttons_html;

buttons_html = '';

for (var i = 0; i < 32; i++) {
  buttons_html = buttons_html + '<div class="preset_button preset_select_button" id="PRESET_SELECT_' + i +'">'+(i+1)+'</div>';
}
document.getElementById("PRESET_BUTTONS").innerHTML=buttons_html;
