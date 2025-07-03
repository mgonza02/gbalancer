// third-party
import { merge } from 'lodash-es';

// project imports
import Badge from './Badge';
import Button from './Button';
import ButtonBase from './ButtonBase';
import Card from './Card';
import CardContent from './CardContent';
import Checkbox from './Checkbox';
import Chip from './Chip';
import CssBaseline from './CssBaseline';
import Drawer from './Drawer';
import FormHelperText from './FormHelperText';
import IconButton from './IconButton';
import InputLabel from './InputLabel';
import LinearProgress from './LinearProgress';
import Link from './Link';
import ListItemButton from './ListItemButton';
import ListItemIcon from './ListItemIcon';
import OutlinedInput from './OutlinedInput';
import Tab from './Tab';
import TableBody from './TableBody';
import TableCell from './TableCell';
import TableHead from './TableHead';
import TableRow from './TableRow';
import Tabs from './Tabs';
import Tooltip from './Tooltip';
import Typography from './Typography';

// ==============================|| OVERRIDES - MAIN ||============================== //

export default function ComponentsOverrides(theme) {
  return merge(
    Badge(theme),
    Button(theme),
    ButtonBase(),
    Card(theme),
    CardContent(),
    Checkbox(theme),
    Chip(theme),
    CssBaseline(theme),
    Drawer(theme),
    FormHelperText(),
    IconButton(theme),
    InputLabel(theme),
    LinearProgress(),
    Link(),
    ListItemButton(theme),
    ListItemIcon(theme),
    OutlinedInput(theme),
    Tab(theme),
    TableBody(theme),
    TableCell(theme),
    TableHead(theme),
    TableRow(),
    Tabs(),
    Tooltip(theme),
    Typography()
  );
}
