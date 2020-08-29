window.onload = function () {
    participantsSelect = document.getElementById("participantsSelect");
    participantsSelect.disabled = true;
    startDatabaseConnection()
}

let participants = [];
let database;

let participantToUpdate;

let participantsSelect;
let resultLabel;

function startDatabaseConnection() {
    firebase.initializeApp(firebaseConfig);

    database = firebase.database().ref('personas');

    database.on('value', function (snapshot) {
        console.warn("Database was updated. Refresh data.")
        parseDataToList(snapshot.val());
    });
}

function parseDataToList(json) {
    participants = [];

    for (key in json) {
        let participant = new Participant(key, json[key].name, json[key].friend, json[key].isSelected);
        participants.push(participant);
    }

    console.log("Participants", participants);

    // Fill select with participants that didn't chose yet
    participantsSelect = document.getElementById("participantsSelect");
    participantsSelect.options.length = 0;
    let option = document.createElement('option');
    option.text = "";
    participantsSelect.add(option);

    participants.forEach(participant => {
        if (participant.friend == "" || participant.friend == null) {
            let option = document.createElement('option');
            option.text = participant.name;
            option.value = participant.id;
            participantsSelect.add(option);
        }
    })

    participantsSelect.disabled = false;
}

function getInvisibleFriend() {
    if (participantsSelect.value != null && participantsSelect.value != "") {
        let participant = participants.find(p => p.id == participantsSelect.value);
        let invisibleFriend;
        //
        if (participant != null) {
            //
            console.log("Getting invisible friend for: ", participant);
            //
            let possibleFriends = participants.filter(p => participant.id != p.id && !p.isSelected);
            //
            let randomIndex = Math.floor(Math.random() * possibleFriends.length);
            invisibleFriend = possibleFriends[randomIndex];
            //
            invisibleFriend.isSelected = true;
            participant.friend = invisibleFriend.name;
            //
            resultLabelSpanish = document.getElementById("resultLabelSpanish");
            resultLabelSpanish.innerHTML = `Tu amig@ invisible es: ${invisibleFriend.name.toUpperCase()}`
            resultLabelEnglish = document.getElementById("resultLabelEnglish");
            resultLabelEnglish.innerHTML = `Your secret friend is: ${invisibleFriend.name.toUpperCase()}`
            //
            document.getElementById('resultLabel').classList.add('fade-in--show');
            document.getElementById('resultLabel').classList.remove('fade-in--hide');
            //
            document.getElementById("pickerContainer").classList.add('fade-out--hide');
            document.getElementById("pickerContainer").classList.add('fade-out--show');
            document.getElementById("pickerContainer").style.pointerEvents = 'none';
        }
        //
        update(participant, invisibleFriend);
    }
}

// Remove all data and then generate test objects.
function generateData() {
    database.remove();

    const names = ["Gonzalo", "Agustina", "Mariana", "Daniel", "Susana", "Martin", "Lulu", "Marcela", "Flavio"];

    names.forEach(name => {
        let participant = new Participant(null, name, "", false);
        save(participant);
    })
}


function save(participant) {
    database.push().set(participant)
        .then(function (snapshot) {
            console.log(`${participant.name} saved successfully`);
        }, function (error) {
            console.log(`ERROR on saving ${participant.name}`);
        });
}

// Update both participant and it's friend in the database with one call.
function update(participant, friend) {
    let updates = {};
    updates[participant.id] = participant;
    updates[friend.id] = friend;
    //
    return database.update(updates);
}


// Functions to help in the development. Will be removed 
// 
//
function showList(participants) {

    let list = document.getElementById("list");
    list.innerHTML = "";

    participants.forEach(item => {
        let listItem = document.createElement('li');
        listItem.innerHTML = `${item.name} - Friend: ${item.friend} - Selected: ${item.isSelected}`;
        list.appendChild(listItem);
    })
}

function showActions() {
    document.getElementById("dataContainer").style.display = document.getElementById("dataContainer").style.display == 'none' || document.getElementById("dataContainer").style.display == "" ? 'flex' : 'none';
    showList(participants);
}

function toggleElement(elementId) {
    document.getElementById(elementId).style.opacity = document.getElementById(elementId).style.opacity == "" || document.getElementById(elementId).style.opacity == 1 ? 0 : 1;
}