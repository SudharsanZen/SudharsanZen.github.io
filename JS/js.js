var projects_button =$('#projects-button');
var home_button     =$('#home-button');
var about_button    =$('#about-button');
var contact_button  =$('#contact-button');
var resume_button   =$('#resume-button');
var game_button   =$('#game-button');
var engine_button   =$('#engine-button');

var home_dir="home.html";
var about_dir="about.html";
var engine_dir="engine.html";
var game_dir="game.html";
var contact_dir="contact.html";

var project_text=$('#projectText');
var project_links=$('.ProjectsTypes')

var home    =   $('.Home');      home.load(home_dir);
var about   =   $('.About');     about.load(about_dir);
var engine  =   $('.Engine');    engine.load(engine_dir);
var game    =   $('.Game');      game.load(game_dir);
var contact =   $('.Contact');   contact.load(contact_dir);

var section_list={"home-button":home,"about-button":about,"engine-button":engine,"game-button":game,"contact-button":contact};
var button_list=[home_button,about_button,engine_button,game_button,contact_button];
var curr_active_section="home-button";
function ShowSection(event)
{

//console.log("from:"+curr_active_section);
section_list[curr_active_section].css("display","none");
section_list[curr_active_section].css("width","0");
section_list[curr_active_section].css("height","0");

curr_active_section=event.currentTarget.id;
//console.log("to:"+curr_active_section);
section_list[curr_active_section].css("display","block");
section_list[curr_active_section].css("width","inherit");
section_list[curr_active_section].css("height","inherit");

}
var i;
for(i=0;i<button_list.length;i++)
  button_list[i].click(ShowSection);
var home_button=$(".control-1");
projects_button.hover(function()
{



  project_text.css("height","0");
  project_text.css("width","0");
  projects_button.css("border-radius","25px");
  project_links.css("opacity","1");
  project_links.css("height","inherit");
  project_links.css("width","300px");
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
