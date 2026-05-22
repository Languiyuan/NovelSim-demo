import { Controller, Sse, Param, Res, Req } from '@nestjs/common';
import { Observable } from 'rxjs';
import { StreamService } from './stream.service';

@Controller('api/stream')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Sse('connect/:saveId')
  connectSSE(@Param('saveId') saveId: number): Observable<any> {
    return this.streamService.connect(Number(saveId));
  }
}
