
var inner_html = '';


for (let i = 0; i < 8; i++) {
  inner_html = inner_html + '<div class="camera_select_button" id="CAMERA_SELECT_' +i+ '" onclick="CameraSelectButton(' + i + ')">'+(i+1)+'</div>';
}
document.getElementById("CAMERA_BUTTONS").innerHTML=inner_html;

inner_html = '';

for (let i = 0; i < 32; i++) {
  inner_html = inner_html + '<div class="preset_button preset_select_button" id="PRESET_SELECT_' + i +'" onclick="PresetSelectButton(' + i + ')">'+(i+1)+'</div>';
}
document.getElementById("PRESET_BUTTONS").innerHTML=inner_html;

inner_html = document.getElementById("BUTTONS_MAP_GRID").innerHTML;
for (let i = 0; i < 17; i++) {
  var index = Math.floor(i/2) + Math.floor(i%2)*9
  inner_html = inner_html + '<div class="settings_line_number">'+index+'</div><select  class="settings_dropdown" id="MAP_BUTTON_ACTION_'+index+'"></select><input type="text" id="BUTTON_VALUE_'+index+'">';
  if(Math.floor(i%2) == 0) inner_html = inner_html + '<div></div>'
}
document.getElementById("BUTTONS_MAP_GRID").innerHTML=inner_html;

var action_options = ["No Action", "Select Camera", "Recall Preset", "Auto Focus", "Manual Focus", "Focus Near", "Focus Far", "One Touch Auto Focus"];
for(let i = 0; i < 17; i++){



  var sel = document.getElementById('MAP_BUTTON_ACTION_'+i);
  for(let j = 0; j < action_options.length; j++) {
      let opt = document.createElement('option');
      opt.innerHTML = action_options[j];
      opt.value = j;
      sel.appendChild(opt);
  }
}
//Page Navigation Page Clicks

document.getElementById("SETTINGS_GEAR").onmousedown = function(){
  document.getElementById("SETTINGS_MASK_PANE").style.display = 'block';
  document.getElementById("SETTINGS_PANE").style.display = 'block';
}

function closeSettingsPane(){
  document.getElementById("SETTINGS_MASK_PANE").style.display = 'none';
  document.getElementById("SETTINGS_PANE").style.display = 'none';
}

function openMapPane(){
  document.getElementById("PAD_MAP_PANE").style.display = 'block';
}

function closeMapPane(){
  document.getElementById("PAD_MAP_PANE").style.display = 'none';
}
