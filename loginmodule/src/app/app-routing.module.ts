import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { UploadComponent } from './upload/upload.component';
import { PreviousrequestsComponent } from './previousrequests/previousrequests.component';


const routes: Routes = [
  
  {
    path:'',
    redirectTo:'login',
    pathMatch:'full'},
  {
    path:'login',
    component:LoginComponent},
  {
    path:'upload',
    component:UploadComponent
  },
  {
  path: 'previousrequests',
  component:PreviousrequestsComponent
  }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
 
 }
