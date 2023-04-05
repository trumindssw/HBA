import { Component, OnInit } from '@angular/core';
import { UploadComponent } from '../upload/upload.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  constructor(private router: Router) { }
  ngOnInit(){
      
  }
  onBtnClick(){
    // Navigate to /products page
    this.router.navigate(['/upload']);
  }
}




