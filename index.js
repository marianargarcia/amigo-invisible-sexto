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

    database = firebase.database().ref('sexto');

    database.on('value', function (snapshot) {
        console.warn("Database was updated. Refresh data.")
        parseData(snapshot.val());
    });
}

function parseData(json) {
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
