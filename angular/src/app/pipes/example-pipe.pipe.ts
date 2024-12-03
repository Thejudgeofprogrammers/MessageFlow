import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'examplePipe',
  pure: true,
})
export class ExamplePipePipe implements PipeTransform {
    transform(arr: any[], property: string): any[] {
        arr.sort((a: any, b: any) => {
            if (a[property] < b[property]) return -1;
            if (a[property] > b[property]) return 1;
            return 0;
        })
        return arr;
    }
}
