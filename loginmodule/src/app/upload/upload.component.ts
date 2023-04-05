import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {
  constructor(private router: Router) { }
  ngOnInit(){
      
  }
  onBtn(){
    // Navigate to /products page
    this.router.navigate(['/previousrequests']);
  }
}
