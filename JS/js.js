var projects_button=$('#projects');
var project_text=$('#projectText');
var project_links=$('.ProjectsTypes')
projects_button.hover(function()
{



  project_text.css("height","0");
  project_text.css("width","0");
  projects_button.css("border-radius","25px");
  project_links.css("opacity","1");
  project_links.css("height","inherit");
  project_links.css("width","inherit");
  project_links.css("padding","10px");
  project_links.css("border-radius","10px");


});
projects_button.mouseleave(function()
{

    project_text.css("height","inherit");
    project_text.css("width","inherit");
    projects_button.css("border-radius","var(--button-radius)");
    project_links.css("opacity","0");
    project_links.css("height","0");
    project_links.css("width","0");
    project_links.css("border-radius","0px");
    project_links.css("padding","0px");

});
