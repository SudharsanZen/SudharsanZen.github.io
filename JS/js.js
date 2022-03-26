var projects_button =$('#projects-button');
var home_button     =$('#home-button');
var about_button    =$('#about-button');
var contact_button  =$('#contact-button');
var resume_button   =$('#resume-button');
var game_button   =$('#game-button');
var engine_button   =$('#engine-button');

var base="http://localhost:8080/";
//var base="https://SudharsanZen.github.io/";
var home_dir=base+"home.html";
var about_dir=base+"about.html";
var engine_dir=base+"engine.html";
var game_dir=base+"game.html";
var contact_dir=base+"contact.html";

var project_text=$('#projectText');
var project_links=$('.ProjectsTypes')

var home    =   $('.Home');      home.load(home_dir);
var about   =   $('.About');
var engine  =   $('.Engine');    engine.load(engine_dir);
var game    =   $('.Game');      game.load(game_dir);
var contact =   $('.Contact');   contact.load(contact_dir);

var section_list={"home-button":home,"about-button":about,"engine-button":engine,"game-button":game,"contact-button":contact};
var button_list=[home_button,about_button,engine_button,game_button,contact_button];
var curr_active_section="about-button";
function deactivate_section()
{
  //console.log("from:"+curr_active_section);
  section_list[curr_active_section].css("display","none");
  section_list[curr_active_section].css("width","0");
  section_list[curr_active_section].css("height","0");
}
function activate_section()
{
  //console.log("to:"+curr_active_section);
  section_list[curr_active_section].css("display","block");
  section_list[curr_active_section].css("width","inherit");
  section_list[curr_active_section].css("height","inherit");
}
activate_section();
function ShowSection(event)
{
console.log("clicked");

deactivate_section()
  if(event.currentTarget.id.localeCompare("engine-section-link")==0)
    curr_active_section="engine-button";
  else
    curr_active_section=event.currentTarget.id;

activate_section()

}
var i;
for(i=0;i<button_list.length;i++)
  button_list[i].click(ShowSection);
about.load(about_dir,
  function()
  {
    var engine_section_list=$("#engine-section-link");
    console.log(engine_section_list);
    engine_section_list.click(ShowSection);
  }
);


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
