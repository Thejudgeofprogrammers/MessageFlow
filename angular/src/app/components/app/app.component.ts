import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
    color = 'green';

    changeColor(newColor: string) {
        this.color = newColor;
    }

    checkCurrentValue(event: Event) {
        const target = event.target as HTMLInputElement
        console.log('e:', target.value);
    }
}
