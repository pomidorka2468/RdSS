const action_panel = document.getElementById("action_panel")
const story_text = document.getElementById("story_text")
const status_text = document.getElementById("section_id")

async function load_section(section_number){
  res = await fetch(`/get_next_sections?section_number=${section_number}`);
  data = await res.json();

  

  story_text.textContent = data["section_text"];
  status_text.textContent = "Sektion " + section_number;
  action_panel.replaceChildren();

  if (Array.isArray(data["items"]) && data["items"].length > 0) {
    data["items"].forEach(item => {
      const item_wrapper = document.createElement("div");
      item_wrapper.id = `btn_item_${item["name"]}`;
      item_wrapper.className = "item_button";
      item_wrapper.onclick = () => pick_item(item["name"]);

      const item_button = document.createElement("button");
      item_button.textContent = item["text"];
      item_wrapper.appendChild(item_button);
      action_panel.appendChild(item_wrapper);
    });
  }

  if (Array.isArray(data["choices"]) && data["choices"].length > 0) {
    data["choices"].forEach(choice => {
      const choice_wrapper = document.createElement("div");
      choice_wrapper.id = `btn_choice_${choice["number"]}`;
      choice_wrapper.className = "choice_button";
      choice_wrapper.onclick = () => load_section(choice["number"]);

      const choice_button = document.createElement("button");
      choice_button.textContent = choice["text"];
      choice_wrapper.appendChild(choice_button);
      action_panel.appendChild(choice_wrapper);
    });
  }
}

async function pick_item(item_name){
  res = await fetch(`/pick_item?item_name=${item_name}`);
  if (res) {
    item_button = document.getElementById("btn_item_"+item_name);
    item_button.className = "hidden";
  } else {
    alert("can not take this item");
  }
}
