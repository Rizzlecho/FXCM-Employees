import {Component, OnInit} from '@angular/core';

import {RemoteService} from "./services/remote/remote.service";
import {FormBuilder, FormGroup} from "@angular/forms";

import {UserModel} from "./services/models/user.model";
import {SearchModel} from "./services/models/search.model";

@Component({
  selector: 'fxcm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'fxcm';

  public create: FormGroup;
  public search: FormGroup;
  public userModel: UserModel;
  public searchModel: SearchModel;

  public showHome: boolean = true;
  public showAdmin: boolean = false;
  public showAllEmployees: boolean = true;
  public noResults: boolean = false;
  public inputFail: boolean = false;
  public critFail: boolean = false;

  public searchInput: string;
  public changeInput: string;;
  public criteria: string;
  public employee: string;
  public authtoken: string;

  public emails: any;
  public employees: any;
  public filteredUsers: any;

  constructor(private fb: FormBuilder, private remoteService: RemoteService) {
    this.userModel = new UserModel('', '', '');
    this.searchModel = new SearchModel('', '',)
  }

  // TOGGLE HOME AND ADMIN
  toggleDisplay() {
    if (this.showHome) {
      this.showHome = false;
      this.showAdmin = true;
    }
    else {
      this.showHome = true;
      this.showAdmin = false;
    }

  }

  ngOnInit() {
    // AUTOMATIC LOGIN FOR KINVEY
    this.remoteService.login('Rizzle', '1234').subscribe(data => {
        this.authtoken = data['_kmd'].authtoken;

        //GET ALL EMPLOYEES
        this.remoteService.getAllUsers(this.authtoken).subscribe(data2 => {
            this.employees = data2;

            for (let i = 0; i < this.employees.length; i++) {
              this.employees[i].email = this.employees[i].name
                .toLowerCase()
                .replace(' ', '') + '@gmail.com'; // CREATE EMAILS WITHOUT STORING THEM INTO BASE
            }

            this.showAllEmployees = true;
          },
          err => {
            console.log(err.message);
          });
      },
      err => {
        console.log(err.message);
      });


    // FORM GROUP FOR CREATE EMPLOYEE
    this.create = this.fb.group({
      name: [''],
      phone: [''],
      department: [''],
    });

    // FORM GROUP FOR SEARCH EMPLOYEE
    this.search = this.fb.group({
      input: [''],
      criteria: [''],
    });
  }

  // CREATE EMPLOYEE THROUGH ADMIN PANEL
  createUser() {
    this.userModel.name = this.create.value['name'];
    this.userModel.phone = this.create.value['phone'];
    this.userModel.department = this.create.value['department'];

    this.remoteService.createUser(this.userModel, this.authtoken).subscribe(data => {

        //GET ALL EMPLOYEES AFTER CREATION
        this.remoteService.getAllUsers(this.authtoken).subscribe(data2 => {
            this.employees = data2;

            for (let i = 0; i < this.employees.length; i++) {
              this.employees[i].email = this.employees[i].name
                .toLowerCase()
                .replace(' ', '') + '@gmail.com'; // CREATE EMAILS WITHOUT STORING THEM INTO BASE
            }

            this.showHome = true;
            this.showAdmin = false;
            this.create.reset();
          },
          err => {
            console.log(err.message);
          });
      },
      err => {
        console.log(err.message);
      })
  }

  // GET CRITERIA FROM OPTION
  onChange(crit) {
    this.criteria = crit;
  }

  // WHEN INPUT IS BLANK LOADS ALL EMPLOYEES
  onChangeInput(input){
    this.changeInput = input;

    if(this.changeInput.length === 0){
      //GET ALL EMPLOYEES
      this.remoteService.getAllUsers(this.authtoken).subscribe(data2 => {
          this.employees = data2;

          for (let i = 0; i < this.employees.length; i++) {
            this.employees[i].email = this.employees[i].name
              .toLowerCase()
              .replace(' ', '') + '@gmail.com'; // CREATE EMAILS WITHOUT STORING THEM INTO BASE
          }

          this.showAllEmployees = true;
        },
        err => {
          console.log(err.message);
        });
    }
  }

  // GET NAME FOR DELETE
  onChangeDel(emp) {
    this.employee = emp;
  }

  // SEARCH FOR EMPLOYEE WITH CRITERIA
  searchFunc() {
    this.searchModel.input = this.search.value['input'];
    this.searchModel.criteria = this.criteria;

    //ERROR NOTIFICATIONS
    if (this.searchModel.input === '') {
      this.inputFail = true;
      this.critFail = false;
      return
    }

    if (this.searchModel.criteria === undefined) {
      this.critFail = true;
      this.inputFail = false;
      return
    }

    this.searchInput = this.searchModel.input.toLowerCase();


    // CHECK FOR PARTIAL RESULTS
    let searchResultsArr = [];

    for (let obj of this.employees) {
      if (this.searchModel.criteria.toLowerCase() === 'name' && obj.name.toLowerCase().includes(this.searchInput)) {
        searchResultsArr.push(obj)
      }
      if (this.searchModel.criteria.toLowerCase() === 'phone' && obj.phone.toLowerCase().includes(this.searchInput)) {
        searchResultsArr.push(obj)
      }
      if (this.searchModel.criteria.toLowerCase() === 'department' && obj.department.toLowerCase().startsWith(this.searchInput)) {
        searchResultsArr.push(obj)
      }
    }

    this.filteredUsers = searchResultsArr;

    this.noResults = this.filteredUsers.length === 0; // CHECK IF NO RESULTS

    this.critFail = false;
    this.inputFail = false;
    this.showAllEmployees = false;
  }

  // DELETE EMPLOYEE
  deleteEmploy() {
    this.remoteService.deleteEmployee(this.employee, this.authtoken).subscribe((data) => {
      //GET ALL EMPLOYEES
      this.remoteService.getAllUsers(this.authtoken).subscribe(data2 => {
          this.employees = data2;

          for (let i = 0; i < this.employees.length; i++) {
            this.employees[i].email = this.employees[i].name
              .toLowerCase()
              .replace(' ', '') + '@gmail.com'; // CREATE EMAILS WITHOUT STORING THEM INTO BASE
          }

          this.showAllEmployees = true;
        },
        err => {
          console.log(err.message);
        });
    })

  }

}
