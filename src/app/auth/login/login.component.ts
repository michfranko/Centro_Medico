import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [ReactiveFormsModule, CommonModule,RouterLink],
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {}

  login(): void {
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password)
      .catch(error => {
        console.error('Error al iniciar sesión:', error);
        // Aquí puedes mostrar un mensaje de error al usuario
      });
  }

  loginWithGoogle(): void {
    this.authService.loginWithGoogle()
      .catch(error => {
        console.error('Error al iniciar sesión con Google:', error);
        // Aquí también puedes mostrar un mensaje de error al usuario
      });
  }

  resetPassword(): void {
  const email = this.loginForm.get('email')?.value;
  if (!email) {
    alert('Ingresa tu correo electrónico para recuperar la contraseña.');
    return;
  }

  this.authService.resetPassword(email)
    .then(() => alert('Correo de recuperación enviado.'))
    .catch(err => console.error('Error al enviar correo:', err));
}

}

