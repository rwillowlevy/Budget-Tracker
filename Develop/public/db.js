window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB | window.msIndexedDB;

if (!window.indexedDB) {
    console.log("IndexedDB is not supported in your browser!")
} else {

    console.log("IndexedDB is supported by your browser.")
    
    let db
    const request = indexedDB.open("budget",1);

    request.onupgradeneeded = event => {
        console.log(event);
        const db = event.target.result;
        // create an object store
        db.createObjectStore("pending", {autoIncrement:true});
        console.log("created db with auto incrementing")
    };

    request.onsuccess = event => {
        db = event.target.result;

        if (navigator.onLine) {
            checkDatabase();
            console.log("We're online!")
        }
    };

    request.onerror = event => {
        console.log("Whoops! " + event.target.errorCode)
    }

    function saveRecord(record) {
        const transaction = db.transaction(["pending"], "readwrite");
        const store = transaction.objectStore("pending");
        store.add(record);
    }

    function checkDatabase() {
        console.log("Checking Database")
        const transaction = db.transaction(["pending"], "readwrite");
        const store = transaction.objectStore("pending");
        const getAll = store.getAll();
        
        getAll.onsuccess = () => {
 
            if (getAll.result.length > 0) {
                fetch("/api/transaction/bulk", {
                  method: "POST",
                  body: JSON.stringify(getAll.result),
                  headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                  }
                })
                .then(response => response.json())
                .then(() => {
                  const transaction = db.transaction(["pending"], "readwrite");
                  const store = transaction.objectStore("pending");
                  store.clear();
                });
              }
            };
        }
    }

    window.addEventListener("online",checkDatabase);