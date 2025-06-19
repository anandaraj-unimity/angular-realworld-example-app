import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from "@angular/core";
import {
  Validators,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ListErrorsComponent } from "../../shared/components/list-errors.component";
import { Errors } from "../models/errors.model";
import { UserService } from "./services/user.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

interface LoginForm {
  loginID: FormControl<string>;
}
interface OtpForm {
  OTP: FormControl<string>;
}
@Component({
  selector: "app-auth-page",
  templateUrl: "./auth.component.html",
  imports: [RouterLink, ListErrorsComponent, ReactiveFormsModule],
})
export default class AuthComponent implements OnInit {
  authType = "";
  title = "";
  errorMessage: string | null = null;
  errors: Errors = { errors: {} };
  isSubmitting = false;
  getOtp: boolean = false;
  authForm: FormGroup<LoginForm>;
  otpForm!: FormGroup<OtpForm>;
  destroyRef = inject(DestroyRef);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly userService: UserService,
    private cdr: ChangeDetectorRef,
  ) {
    this.authForm = new FormGroup<LoginForm>({
      loginID: new FormControl("", {
        validators: [Validators.required],
        nonNullable: true,
      }),
      // OTP: new FormControl("", {
      //   validators: [Validators.required],
      //   nonNullable: true,
      // }),
    });
  }

  ngOnInit(): void {
 
   
    this.authType = this.route.snapshot.url.at(-1)!.path;
    this.title = this.authType === "login" ? "Sign in" : "Sign up";
    // if (this.authType === "register") {
    //   this.authForm.addControl(
    //     "username",
    //     new FormControl("", {
    //       validators: [Validators.required],
    //       nonNullable: true,
    //     }),
    //   );
    // }
    
 
  }

  // submitForm(): void {
  //   this.isSubmitting = true;
  //   this.errors = { errors: {} };

  //   const loginID = this.authForm.get("loginID")?.value!;
  //   const accountType = 3; // use correct value depending on your logic

  //   let observable =
  //     this.authType === "login"
  //       ? this.userService.login(loginID, accountType)
  //       : this.userService.register(
  //           this.authForm.value as {
  //             email: string;
  //             password: string;
  //             username: string;
  //           },
  //         );

  //   observable.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
  //     next: () => {
  //       this.getOtp = true;
  //          this.authForm.addControl(
  //         "OTP",
  //         new FormControl("", {
  //           validators: [Validators.required],
  //           nonNullable: true,
  //         })
  //       );

  //       this.isSubmitting = false;
  //       // void this.router.navigate(["/"]);
  //     },
  //     error: (err) => {
  //       this.errors = err;
  //       this.isSubmitting = false;
  //     },
  //   });
  // }

  submitForm(): void {
     this.errorMessage=''
    this.isSubmitting = true;
    this.errors = { errors: {} };

    const loginID = this.authForm.get("loginID")?.value!;
    const accountType = 3;

    // If OTP is already shown, verify it
    if (this.getOtp) {
      const otp = this.otpForm.get("OTP")?.value;
      
      this.userService
        .otplogin(loginID, accountType, Number(otp))
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res) => void this.router.navigate(["/"]),
          error: (err) => {
            this.errors = err;
             this.errorMessage = err?.error?.message || 'Something went wrong!';
            this.isSubmitting = false;
          },
        });
    } else {
      // First step: request OTP
      this.userService
        .login(loginID, accountType)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res) => {
            this.getOtp = true;
            this.otpForm = new FormGroup<OtpForm>({
              OTP: new FormControl("", {
                validators: [Validators.required],
                nonNullable: true,
              }),
            });
            this.isSubmitting = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.errorMessage = err?.error?.message || 'Something went wrong!';
            this.errors = err;
            this.isSubmitting = false;
          },
        });
    }
  }
}
