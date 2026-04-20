import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { TrimOnBlurDirective } from './trim-on-blur.directive';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, TrimOnBlurDirective],
  template: `<input [formControl]="control" appTrimOnBlur>`
})
class TestHostComponent {
  control = new FormControl('  начальное значение  ');
}

@Component({
  standalone: true,
  imports: [TrimOnBlurDirective],
  template: `<input appTrimOnBlur>`
})
class TestNoFormControlComponent {
}

describe('TrimOnBlurDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let inputElement: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    inputElement = fixture.nativeElement.querySelector('input');
  });

  it('should trim the value on blur input in form', () => {
    const dirtyValue = '   Angular is awesome   ';
    const expectedValue = 'Angular is awesome';

    fixture.componentInstance.control.setValue(dirtyValue);
    fixture.detectChanges();

    inputElement.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toEqual(expectedValue)
  });

  it('should trim the value on blur input in single input', () => {

    const fixtureNoForm = TestBed.createComponent(TestNoFormControlComponent);
    fixtureNoForm.detectChanges();
    const input = fixtureNoForm.nativeElement.querySelector('input');

    const valueWithSpaces = '   no control   ';
    const expectValue = 'no control';
    input.value = valueWithSpaces;

    input.dispatchEvent(new Event('blur'));
    fixtureNoForm.detectChanges();

    expect(input.value).toEqual(expectValue);
  });

  it('should dispatch "input" event after trimming', () => {
    const fixtureNoForm = TestBed.createComponent(TestNoFormControlComponent);
    fixtureNoForm.detectChanges();
    const input = fixtureNoForm.nativeElement.querySelector('input');

    const inputSpy = jasmine.createSpy('inputSpy');
    input.addEventListener('input', inputSpy);

    input.value = '   test   ';
    input.dispatchEvent(new Event('blur'));
    fixtureNoForm.detectChanges();

    expect(inputSpy).toHaveBeenCalled();
  });

  it('should return empty string', () => {

    const fixtureNoForm = TestBed.createComponent(TestNoFormControlComponent);
    fixtureNoForm.detectChanges();
    const input = fixtureNoForm.nativeElement.querySelector('input');

    const valueWithSpaces = '    ';
    const expectValue = '';
    input.value = valueWithSpaces;

    input.dispatchEvent(new Event('blur'));
    fixtureNoForm.detectChanges();

    expect(input.value).toEqual(expectValue);
  });
})