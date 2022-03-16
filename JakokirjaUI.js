(function(){
    'use strict';

    const _5360002 = [["37120 KAPPALAISENTIE 38,31,29","37120 KAPPALAISENTIE 2,4", "KÄÄNNY OIKEALLE KAPPALAISENTIELLE<br>JATKA TIEN ALKUUN SAAKKA, KÄÄNNY YMPÄRI JA PALAA, JAA VASEN", false],
    ["37120 KAPPALAISENTIE 2,4","KEHONTIE", "AJA KAPPALAISENTIEN RISTEYKSEN OHI", true]
    ]//Not used yet, for an upcoming feature

    const LEHDET = ["7PV", "AD", "AKUJ", "APKR", "APRI", "APTE", "APU","AVOT", "BILD",  "EEVA", "ETTE", "FIL", "GLKO", "GLOR", "GLRU", "GTI", "HYVE","HYTE", "JYA1", "KATE","KOKE", "KOVI", "IMAG",
        "LUON1", "MAKU", "MATK", "MOND", "MÖKK", "PELI", "PRIN", "RESE1", "SPOR", "SUUR1","TALO", "TIED", "TUUL", "UNEL","UNI1", "V8", "VIHE", "VOIH"]//MÖKK EI TOIMI
    const KIRJEET = ["EP", "ST", "HA", "RY", "KI", "JY"]//KI & JY Laastaria, KI=KIRJE & JY = JYK

    const DIMSTYLE = 'style="color:grey"'
    const LEHTISTYLE = "color:#00ff00;font-weight:bold"
    const KIRJESTYLE = "color:#30c0ef;font-weight:bold"
    const MUUSTYLE = "color:#ff0000;font-weight:bold"

    /////////////////////////////////////MAIN///////////////////////////////////////////////////////

    addressCounterParser()
    boxStyler()
    houseDoorStyler()
    doorKeyStyler()
    directionStyler()

    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    function postType(node_){
        let return_ = { "type": null, "amount": null }
        const children = node_.childNodes

        let tyyppi = null
        if (children.length > 3) {
            return_.amount = parseInt(children[1].childNodes[0].nodeValue)
            tyyppi = children[2].nodeValue.trim().split(/[\s(]+/)[0]
        }
        else {
            return_.amount = 1
            tyyppi = children[0].nodeValue.trim().split(/[\s(]+/)[0]
        }
        
        if (LEHDET.includes(tyyppi)) {
            return_.type = 0
        }
        else if (KIRJEET.includes(tyyppi.substring(0, 2))) {
            return_.type = 1
        }
        else {
            console.log(tyyppi)
            return_.type = 2
        }
        return return_
    }

    function addressCounterParser(){

        const timelines = document.querySelectorAll(".timeline")
        let counter = 1
        
        for (const timeline of timelines) {

            addressIndexParser(timeline, counter)

            let lehdet = 0
            let kirjeet = 0
            let muut = 0

            const papers = timeline.childNodes[1].childNodes[1]

            if (papers === undefined) {
                continue
            }

            let lehdetStyle = DIMSTYLE
            let kirjeetStyle = DIMSTYLE
            let muutStyle = DIMSTYLE

            for (const paper of papers.childNodes) {
                if (paper.nodeName == "SPAN") {
                    const postClass = postType(paper)
                    if (postClass.type == 0) {
                        lehdet += postClass.amount
                        lehdetStyle = `style=${LEHTISTYLE}`
                        paper.style = LEHTISTYLE
                    }
                    else if (postClass.type == 1) {
                        kirjeet += postClass.amount
                        kirjeetStyle = `style=${KIRJESTYLE}`
                        paper.remove()
                    }
                    else {
                        muut += postClass.amount
                        muutStyle = `style=${MUUSTYLE}`
                        paper.style = MUUSTYLE
                    }
                }
            }
            
            const lehdetFrame = `<i ${lehdetStyle}>${lehdet}</i>`
            const kirjeetFrame = `<i ${kirjeetStyle}>${kirjeet}</i>`
            const muutFrame = `<i ${muutStyle}>${muut}</i>`
            const infoText = `<div style="padding:5px;color:white"> lehdet: ${lehdetFrame}, kirjeet: ${kirjeetFrame}, muut: ${muutFrame} </div>`
            if (lehdet + kirjeet + muut != 0)
                papers.innerHTML = `<div class="tamper-type-counter">${infoText}</div>` + papers.innerHTML
            counter++
        }       
    }

    function addressIndexParser(timeline, counter){
        
            let temp = timeline
            let header = null

            while (true) {
                temp = temp.previousSibling
                if (temp == null) {
                    break
                }
                if (temp.className == "sticky-header") {
                    header = temp
                    break
                }
            }

            if (header != null) {
                header.innerHTML = "#" + counter + ":" + header.innerHTML
            }
    }

    function boxStyler(){

        const metalBAWKSES = document.querySelectorAll(".box")
        
        for (let BAWKS of metalBAWKSES){

            const types = boxCounterParser(BAWKS.querySelectorAll(".regularProduct"))

            if(types[0][0] + types[1][0] + types[2][0] == 0) continue

            const lehdetFrame = `<i ${types[0][1]}>${types[0][0]}</i>`
            const kirjeetFrame = `<i ${types[1][1]}>${types[1][0]}</i>`
            const muutFrame = `<i ${types[2][1]}>${types[2][0]}</i>`
            const infoText = `<div style="padding:5px;color:white"> lehdet: ${lehdetFrame}, kirjeet: ${kirjeetFrame}, muut: ${muutFrame} </div>`

            BAWKS.innerHTML = `<div class="box-counter">${infoText}</div>` + BAWKS.innerHTML
        }
    }

    function boxCounterParser(nodeList_){
        
        let types = [[0, DIMSTYLE],[0, DIMSTYLE],[0, DIMSTYLE]]

        for (let node_ of nodeList_){

            if (postType(node_).type == 0){
                types[0][0] += 1
                node_.style = LEHTISTYLE
            }
            else if (postType(node_).type == 1){
                types[1][0] += 1
                node_.style = KIRJESTYLE
            }
            else {
                types[2][0] += 1
                node_.style = MUUSTYLE
            }
        }
        
        if (types[0][0] > 0) types[0][1] = `style=${LEHTISTYLE}`
        if (types[1][0] > 0) types[1][1] = `style=${KIRJESTYLE}`
        if (types[2][0] > 0) types[2][1] = `style=${MUUSTYLE}`

        return types
    }

    function houseDoorStyler(){
        const HD = document.querySelectorAll(".door, .house")

        for (let door of HD){
        const products = door.querySelectorAll(".regularProduct")
        
            for (let node_ of products){
                if (postType(node_).type == 0){
                    node_.style = LEHTISTYLE
                }
                else if (postType(node_).type == 1){
                    node_.style = KIRJESTYLE
                }
                else {
                    console.log(postType(node_).type)
                    node_.style = MUUSTYLE
                }
            }
        }
    }
    
    function doorKeyStyler(){
        const keys = document.querySelectorAll(".key")
        const keystyle = 'style="background-color:#800080;color:#ffffff;left:10px;font-weight:bold;margin:5px;padding:5px;text-align:center"'
    
        for (let key of keys){
            key.innerHTML = `<div class=directionFrame; ${keystyle}> ${key.innerHTML} </div>`
        }
    }

    function directionStyler(){
        const directions = document.querySelectorAll(".directions")
        const direstyle = 'style="background-color:#aa0000;color:#30e0e0;font-weight:bold;left:5%;position:relative;width:90%;margin:5px;text-align:center"'
         for (let direction of directions){
             direction.innerHTML = `<div class=directionFrame; ${direstyle}> ${direction.innerHTML} </div>`
         }
    }
})();