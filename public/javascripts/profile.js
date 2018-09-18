
var triggers = document.getElementsByClassName('clist')[0].getElementsByTagName('span');
for(let j=0;j<triggers.length;j++){
    triggers[j].addEventListener('click',function(ev){
        let trigger = ev.target;
        for(let k =0;k< triggers.length;k++){
             if(triggers[k].classList.contains('active'))
                triggers[k].classList.remove('active');
        }
        trigger.classList.add('active');
        switchView(trigger.id.split('_')[0])
        
    })
}
//EventListeners -----

window.onload = switchView(document.getElementById('acc'));


// Functions ---------
async function switchView(id) {
    try {
        let Text = document.getElementById(id).innerHtml;
        let contents = document.getElementsByClassName('cntnt');

        for (let i in contents) {
            if(contents[i].id != id)
                {   $(contents[i]).fadeOut(400);
                     await delay(400);
                    contents[i].classList.add('vanished'); }
                else{
                contents[i].classList.contains('vanished')?contents[i].classList.remove('vanished'):{};
                $(contents[i]).fadeIn(400);
            }
            }

    } catch (e) { }
}

function delay(time){
    return new Promise((setTimeout(resolve(),time)))
}