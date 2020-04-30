class firebase{
  constructor(){
    this.url = "https://time-tracking-7ed37.firebaseio.com/";
    this.base = fbsDB.getDatabaseByUrl(this.url);
  }
  
  setData(path, data){
    for(let k in data){
      this.base.setData(k, data[k]);
    }    
  }
  
  getData(path, optQueryParams){
    return this.base.getData(path,optQueryParams);
  }
  
  getMultiplePaths(pathsArray){
    return this.base.getAllData(pathsArray);
  }
  
  pushData(path, data, optQueryParams){
    for(let k in data){
      this.base.pushData(k, data[k]);
    }    
    
  }
  
  updateData(path, data, opQueryParams){
    this.base.updateData(path, data);
  }
  
  removeData(path, optQueryParams){
    this.base.removeData(path);
  }
  
  createFirebaseAuthToken(){
    var baseUrl = "https://samplechat.firebaseio-demo.com/";
    var secret = "rl42VVo4jRX8dND7G2xoI";
    var database = FirebaseApp.getDatabaseByUrl(baseUrl, secret);
    
    var serviceAccountEmail = "auth-token-service-account@firebase-asfds.iam.gserviceaccount.com";
    
    var privateKey = "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCPt236u6qZw9WtsZaCjuGVqA1fhUedaCNTWSudDg==\n-----END PRIVATE KEY-----\n";
    
    var token = database.createAuthToken(
      Session.getEffectiveUser().getEmail(),
      null,
      serviceAccountEmail,
      privateKey)
    
    Logger.log(token);
  }

}




/* // Set the configuration for your app
  // TODO: Replace with your app's config object
  var firebaseConfig = {
    apiKey: '<your-api-key>',
    authDomain: '<your-auth-domain>',
    databaseURL: '<your-database-url>',
    storageBucket: '<your-storage-bucket-url>'
  };
  firebase.initializeApp(firebaseConfig);

  // Get a reference to the storage service, which is used to create references in your storage bucket
  var storage = firebase.storage();
  */