import { Component, computed, input, linkedSignal, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-avatar',
  imports: [RouterLink],
  templateUrl: './avatar.html',
})
export class Avatar {
  readonly imageUrl = input<string | null>(null);
  readonly name = input('');
  readonly action = input<'edit' | 'upload'>('edit');
  readonly uploading = input(false);
  readonly fileSelected = output<File>();

  protected readonly failed = linkedSignal({
    source: () => this.imageUrl(),
    computation: () => false,
  });

  protected readonly shown = computed(() => (this.failed() ? null : this.imageUrl()));

  protected onError(): void {
    this.failed.set(true);
  }

  protected pick(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.fileSelected.emit(file);
    }
    input.value = '';
  }
}
