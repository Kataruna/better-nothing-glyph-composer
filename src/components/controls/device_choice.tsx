import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { kAllowedModels, kPhoneModelNames } from '@/lib/consts';
import useGlobalAppStore from '@/lib/timeline_state';
import { toast } from 'sonner';

export default function DeviceChoiceComponent() {
  const currentDevice = useGlobalAppStore((state) => state.phoneModel);
  const { clear } = useGlobalAppStore.temporal.getState();
  const changePhoneModel = useGlobalAppStore((state) => state.changePhoneModel);

  return (
    <Select
      onValueChange={(e: string) => {
        if (e === 'NP1_15') {
          toast.info('Caution: NP(1) in 15 Zone Mode', {
            description:
              'This is not well supported well by the Phone(1), premature pausing the track in the middle of the playback may cause Glyph to get stuck, toggle glyph torch On and Off to fix. This is Nothing OS issue, please ask Nothing to fix ;-;',
            action: {
              label: 'Ok',
              onClick: () => {}
            },
            duration: 2500
          });
        }
        changePhoneModel(e);
        clear();
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder={kPhoneModelNames[currentDevice]} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Nothing Phones</SelectLabel>
          {kAllowedModels.map((model, index) => (
            <SelectItem key={index} value={model}>
              {kPhoneModelNames[model]}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}