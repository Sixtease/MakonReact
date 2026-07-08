import React from 'react';
import PropTypes from 'prop-types';
import { Check, Download, Play, Square } from 'lucide-react';

function is_ctrl_enter_event(evt) {
  return evt.ctrlKey && evt.key === 'Enter';
}

class EditWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      edited_subtitles: '',
      show_filename_input: false,
      download_filename: 'makon.wav',
    };
  }

  _is_shown() {
    const me = this;
    const selw = me.props.selected_words;
    return selw.length > 0;
  }

  render() {
    const {
      is_playing,
      audio,
      playback_on,
      playback_off,
      onSubmit,
    } = this.props;
    let cls = 'edit-window';
    if (this._is_shown()) {
      cls += ' is-shown';
    }
    return (
      <div className={cls}>
        <textarea
          name="edited_subtitles"
          value={this.state.edited_subtitles}
          onChange={this.onEditedSubtitlesChange}
        />
        {is_playing ? (
          <button
            onClick={() => playback_off(audio)}
            title="zastavit"
          >
            <Square size={16} />
          </button>
        ) : (
          <button
            onClick={() => playback_on(audio)}
            title="přehrát"
          >
            <Play size={16} />
          </button>
        )}
        <button
          onClick={() => onSubmit({ edited_subtitles: this.state.edited_subtitles })}
          title="odeslat"
        >
          <Check size={16} />
        </button>
        <span style={{ float: 'right' }}>
          {this.state.show_filename_input ? (
            [
              <input
                type="text"
                value={this.state.download_filename}
                onChange={evt =>
                  this.setState({ download_filename: evt.target.value })
                }
                key={1}
              />,
              this.props.download_object_url ? (
                <a
                  href={this.props.download_object_url}
                  download={this.state.download_filename}
                  key={2}
                >
                  <button type="button">
                    <Download size={16} />
                  </button>
                </a>
              ) : (
                <button
                  disabled="disabled"
                  key={2}
                  type="button"
                >
                  <Download size={16} />
                </button>
              )
            ]
          ) : (
            <button
              onClick={() => this.commence_download()}
              title="stáhnout audio"
            >
              <Download size={16} />
            </button>
          )}
        </span>
      </div>
    );
  }

  suggest_filename() {
    const me = this;
    const {
      stem,
      edit_window_timespan: { start, end }
    } = me.props;
    if (start === null || end === null) {
      return 'makon_nahravka_' + stem + '_usek.wav';
    }
    return (
      'makon_nahravka_' +
      stem +
      '_usek_od_' +
      start.toFixed(2) +
      '_do_' +
      end.toFixed(2) +
      '.wav'
    );
  }

  onEditedSubtitlesChange = evt => {
    this.setState({ edited_subtitles: evt.target.value });
  };

  commence_download() {
    this.object_url = this.props.download_edit_window();
    this.setState({
      show_filename_input: true
    });
  }

  componentDidUpdate(prevProps) {
    const ps = prevProps.selected_words;
    const ns = this.props.selected_words;

    if (
      this.props.edit_window_timespan.start !== null &&
      this.props.edit_window_timespan.end !== null &&
      (
        prevProps.edit_window_timespan.start !== this.props.edit_window_timespan.start ||
        prevProps.edit_window_timespan.end !== this.props.edit_window_timespan.end
      )
    ) {
      this.setState({ download_filename: this.suggest_filename() });
    }

    if (
      prevProps.edit_window_timespan.start !== this.props.edit_window_timespan.start ||
      prevProps.edit_window_timespan.end !== this.props.edit_window_timespan.end
    ) {
      this.setState({ show_filename_input: false });
      this.object_url = null;
    }

    if (!(ps && ps.length) && !(ns && ns.length)) {
      return;
    }

    if (
      !ps ||
      ps.length !== ns.length ||
      (ps[0] && !ns[0]) ||
      ps[0].timestamp !== ns[0].timestamp ||
      ps[ps.length - 1].timestamp !== ns[ns.length - 1].timestamp
    ) {
      const selw_str = ns.map(w => w.occurrence).join(' ');
      if (selw_str && selw_str !== this.state.edited_subtitles) {
        this.setState({ edited_subtitles: selw_str });
      }
    }
  }

  componentDidMount() {
    this.setState({
      show_filename_input: false,
      download_filename: this.suggest_filename()
    });
    this.object_url = null;
    if (!window.KEY_SEND_SUBS_CTRL) {
      window.KEY_SEND_SUBS_CTRL = evt => {
        if (is_ctrl_enter_event(evt) && this._is_shown()) {
          evt.preventDefault();
          this.props.onSubmit({ edited_subtitles: this.state.edited_subtitles });
        }
      };
      document.addEventListener('keydown', window.KEY_SEND_SUBS_CTRL);
    }
  }

  componentWillUnmount() {
    if (window.KEY_SEND_SUBS_CTRL) {
      document.removeEventListener('keydown', window.KEY_SEND_SUBS_CTRL);
      window.KEY_SEND_SUBS_CTRL = null;
    }
  }
}

EditWindow.propTypes = {
  audio: PropTypes.object,
  download_edit_window: PropTypes.func,
  download_object_url: PropTypes.string,
  edit_window_timespan: PropTypes.object,
  is_playing: PropTypes.bool,
  onSubmit: PropTypes.func,
  playback_off: PropTypes.func,
  playback_on: PropTypes.func,
  selected_words: PropTypes.array
};
export default EditWindow;
