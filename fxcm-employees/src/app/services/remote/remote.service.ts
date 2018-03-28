import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';


// Models
import {UserModel} from "../models/user.model";

const hostUrl = 'https://baas.kinvey.com'; // HOST URL
const appKey = "kid_S1PJxO8cf"; // APP KEY HERE;
const appSecret = "311b3ee248194e40bcb3abdda6e3b30a"; // APP SECRET HERE;

const loginUrl = `${hostUrl}/user/${appKey}/login`;

const UserUrl = `${hostUrl}/appdata/${appKey}/employees`; //  ?query=


@Injectable()
export class RemoteService {

  constructor(private http: HttpClient) {
  }


  login(username, password) {
    return this.http.post(
      loginUrl,
      JSON.stringify({username: username, password: password}),
      {
        headers: {
          'Authorization': `Basic ${btoa(`${appKey}:${appSecret}`)}`,
          'Content-Type': 'application/json'
        }
      }
    )
  }

  createUser(userModel: UserModel, authtoken) {
    return this.http.post(
      UserUrl,
      JSON.stringify(userModel),
      {
        headers:{
          'Authorization': `Kinvey ${authtoken}`,
          'Content-Type': 'application/json'
        }
      }
    )
  }

  getAllUsers(authtoken) {
    return this.http.get(
      UserUrl,
      {
        headers: {
          'Authorization': `Kinvey ${authtoken}`,
          'Content-Type': 'application/json'
        }
      }
    )
  }

  deleteEmployee(empName, authtoken){
    return this.http.delete(
      UserUrl + `?query={"name":"${empName}"}`,
      {
        headers: {
          'Authorization': `Kinvey ${authtoken}`,
          'Content-Type': 'application/json'
        }
      }
    )
  }

}

